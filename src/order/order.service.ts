import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CancelOrderRequestDto,
  ComponentRequestDto,
  DiagnosisRequestDto,
  OrderRequestDto,
  UpdateIncurredCost,
} from './dto/request.dto';
import { OrderStatus } from 'src/enum/order-status.enum';
import { User } from '@prisma/client';
import { Role } from 'src/enum/role';
import { NotificationService } from 'src/notification/notification.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OrderReponseDto } from './dto/response.dto';
import { UserStatus } from 'src/enum/user-status';
import { Coordinate, getDistance } from 'src/utils/getDistance';
import { Queue } from './Queue';
import { interval, Subject } from 'rxjs';
import { takeUntil, switchMap, delay } from 'rxjs/operators';

enum StatisticType {
  Outcome = 'outcome',
  Service = 'service',
  Order = 'order',
}
@Injectable()
export class OrderService implements OnModuleInit {
  public static intervalDur = 20000;
  public static assignRadius = 5;
  private destroy$ = new Subject<void>();
  private interval$ = new Subject<number>();
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private jwtService: JwtService,
    private config: ConfigService,
    private orderQueue: Queue,
  ) {}

  onModuleInit() {
    console.log('restart server');
    this.startInterval();
    setTimeout(async () => {
      await this.getAllPendingOrderToAssign();
    }, 5000);
    setTimeout(async () => {
      const configs = await this.prisma.systemConfig.findMany();
      OrderService.intervalDur = configs[0]
        ? configs[0].assignOrderInterval * 60000
        : 20000;
      OrderService.assignRadius = configs[0]
        ? configs[0].distanceToAssignOrder
        : 5;
      this.updateInterval(OrderService.intervalDur);
    }, 5000);
    setInterval(
      async () => {
        await this.checkOrders();
      },
      1000 * 60 * 5,
    );
  }

  private startInterval(): void {
    this.interval$
      .pipe(
        switchMap((intervalDuration) =>
          interval(intervalDuration).pipe(takeUntil(this.destroy$)),
        ),
        delay(0),
      )
      .subscribe(async () => {
        console.log({ queue: this.orderQueue.getQueue() });
        if (
          Array.isArray(this.orderQueue.getQueue()) &&
          this.orderQueue.getQueue().length > 0
        ) {
          const order = this.orderQueue.dequeue();
          await this.processOrder(order);
        }
      });
  }

  updateInterval(newInterval: number): void {
    this.interval$.next(newInterval);
  }

  stopInterval(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addOrderToQueue(order: {
    orderId: string;
    skills: number[];
    coordinate: Coordinate;
  }) {
    this.orderQueue.enqueue(order);
  }

  async processOrder(order: {
    orderId: string;
    skills: number[];
    coordinate: Coordinate | null;
  }) {
    console.log('process order: ' + JSON.stringify(order));
    const { orderId, skills, coordinate } = order;
    if (coordinate === null) return;
    const repairmans = await this.prisma.user.findMany({
      where: {
        role: Role.ROLE_REPAIRMAN,
        status: UserStatus.ACTIVE,
      },
      include: {
        repairmanSkill: true,
        address: true,
      },
    });
    const repairmanList = repairmans
      .filter((repairman) => {
        if (
          !repairman.address ||
          repairman.address.length === 0 ||
          repairman.address[0].latitude === null ||
          repairman.address[0].longitude === null
        )
          return false;
        else return true;
      })
      .map((rpm) => {
        if (rpm) {
          return {
            repairmanId: rpm.userId,
            coordinate: {
              latitude: rpm.address[0].latitude,
              longitude: rpm.address[0].longitude,
            },
            skills:
              Array.isArray(rpm.repairmanSkill) && rpm.repairmanSkill.length > 0
                ? rpm.repairmanSkill.map((skill) => skill.skillId)
                : [],
          };
        }
      });
    const suitableRepairmans = [];
    if (
      Array.isArray(repairmanList) &&
      repairmanList.length > 0 &&
      Array.isArray(repairmanList) &&
      repairmanList.length > 0
    ) {
      repairmanList.forEach((rpm) => {
        const isSuitable = skills.every((skill: number) =>
          rpm.skills.includes(skill),
        );

        if (isSuitable) suitableRepairmans.push(rpm);
      });
    }

    if (Array.isArray(suitableRepairmans) && suitableRepairmans.length > 0) {
      const filterdRepairmanByCoordinate = suitableRepairmans
        .map((rpm) => {
          return {
            ...rpm,
            distance: getDistance(coordinate, rpm.coordinate),
          };
        })
        .filter((rpm) => rpm && rpm.distance < 5)
        .sort((rpm1, rpm2) => rpm1 && rpm2 && rpm1.distance - rpm2.distance);

      console.log({ filterdRepairmanByCoordinate });
      if (
        Array.isArray(filterdRepairmanByCoordinate) &&
        filterdRepairmanByCoordinate.length > 0
      ) {
        console.log({ choose: filterdRepairmanByCoordinate[0] });
        await this.assignOrder(
          parseInt(orderId),
          filterdRepairmanByCoordinate[0].repairmanId,
        );
      } else {
        return;
      }
    } else {
      return;
    }
  }

  async createOrder(dto: OrderRequestDto, userId: string) {
    console.log(JSON.stringify(dto));
    try {
      const order = await this.prisma.order.create({
        data: {
          userId: userId,
          code: userId.slice(3, 10) + Date.now(),
          expectedDate: dto.expectedDate,
          status: OrderStatus.PENDING,
          addressId: dto.addressId,
        },
      });

      const orderDetails = await Promise.all(
        dto.orderDetail?.map(
          async (value) =>
            await this.prisma.orderDetail.create({
              data: {
                serviceId: value.serviceId,
                desc: value.desc,
                orderId: order.orderId,
              },
            }),
        ),
      );

      if (dto.orderDetail.every((detail) => detail.media !== undefined)) {
        await Promise.all(
          orderDetails?.map(
            async (value, idx) =>
              await this.prisma.orderMedia.createMany({
                data: dto.orderDetail[idx].media.map((val) => {
                  return {
                    orderDetailId: value.orderDetailId,
                    mediaType: val.mediaType,
                    url: val.url,
                    alt: val.alt,
                  };
                }),
              }),
          ),
        );
      }

      const skills = [];
      let total = 0;
      Promise.all(
        dto.orderDetail.map(async (detail) => {
          const service = await this.prisma.service.findUnique({
            where: {
              serviceId: detail.serviceId,
            },
          });

          if (service && service.skillId) {
            skills.push(service.skillId);
          }

          if (service.type === 0) total += parseInt(service.price.toString());
        }),
      );
      await this.prisma.order.update({
        where: {
          orderId: order.orderId,
        },
        data: {
          total: total,
        },
      });
      const address = await this.prisma.userAddress.findUnique({
        where: {
          addressId: dto.addressId,
        },
      });
      let coordinate: Coordinate | null;
      if (!address || !address.latitude || !address.latitude) {
        coordinate = null;
      } else {
        coordinate = {
          latitude: address.latitude,
          longitude: address.longitude,
        };
      }
      this.addOrderToQueue({
        orderId: order.orderId.toString(),
        skills,
        coordinate,
      });
      return {
        message: 'create successful',
        orderId: order.orderId.toLocaleString(),
      };
    } catch (error) {
      throw error;
    }
  }

  async cancelOrder(user: User, dto: CancelOrderRequestDto) {
    const { userId, role } = user;
    try {
      const existedOrder = await this.prisma.order.findUnique({
        where: {
          orderId: dto.orderId,
        },
      });

      if (!existedOrder) {
        return new NotFoundException('Order is not found');
      }

      if (role === Role.ROLE_USER && userId !== existedOrder.userId) {
        return new ForbiddenException(
          'You are not permited to change this order',
        );
      }

      await this.prisma.order.update({
        where: {
          orderId: dto.orderId,
        },
        data: {
          status: OrderStatus.REJECTED,
        },
      });
      await this.notificationService.createNotification({
        userId: existedOrder.userId,
        content: dto.reason,
        title: `Đơn dịch vụ ${existedOrder.code} đã được hủy.`,
      });
      return {
        message: 'Cancel order successfully',
      };
    } catch (error) {}
  }

  async getOrderById(orderId: number, user: User) {
    try {
      const order = await this.prisma.order.findUnique({
        where: {
          orderId,
        },
        include: {
          orderDetails: {
            include: {
              media: true,
              service: true,
              diagnosis: true,
            },
          },
          user: true,
          repairman: true,
          address: true,
          components: true,
        },
      });

      if (user.role === Role.ROLE_USER && user.userId !== order.userId) {
        return new ForbiddenException(
          'You are not permited to access this data',
        );
      }
      return OrderReponseDto.formatDto(order);
    } catch (error) {
      throw error;
    }
  }

  async getAllOrder(query: any) {
    const { from, to, status, repairmanId, page, limit } = query;
    let searchTime = {};
    if (from) {
      searchTime = {
        createdAt: {
          gte: from,
        },
      };
    }

    if (to) {
      searchTime = {
        createdAt: {
          lte: to,
        },
      };
    }

    if (from && to) {
      searchTime = {
        AND: [
          {
            createdAt: {
              gte: from,
            },
          },
          {
            createdAt: {
              lte: to,
            },
          },
        ],
      };
    }

    let searchStatus = {};
    if (status) {
      searchStatus = {
        status: parseInt(status),
      };
    }

    let searchRepairman = {};
    if (repairmanId) {
      searchRepairman = {
        repairmanId,
      };
    }

    let pagination = {};
    if (page && limit) {
      pagination = {
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      };
    }

    try {
      const orders = await this.prisma.order.findMany({
        where: {
          ...searchTime,
          ...searchStatus,
          ...searchRepairman,
        },
        include: {
          orderDetails: {
            include: {
              media: true,
              service: true,
              diagnosis: true,
            },
          },
          repairman: true,
          user: true,
          // components: true,
          address: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        ...pagination,
      });

      return orders.map((order) => OrderReponseDto.formatDto(order));
    } catch (error) {
      throw error;
    }
  }

  async getOrdersByUserId(user: User, query: any, orderUserId: string) {
    const { userId, role } = user;
    console.log({ userId, orderUserId });
    const { status } = query;
    if (userId !== orderUserId && role === Role.ROLE_USER) {
      throw new ForbiddenException(
        'You are not permitted to access this asset',
      );
    }
    try {
      let orders = [];
      if (status.length > 0) {
        orders = await this.prisma.order.findMany({
          where: {
            userId: orderUserId,
            status: parseInt(status),
          },
          include: {
            orderDetails: {
              include: {
                service: true,
              },
            },
            repairman: true,
            user: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        });
      } else {
        orders = await this.prisma.order.findMany({
          where: {
            userId: orderUserId,
          },
          include: {
            orderDetails: {
              include: {
                service: true,
              },
            },
            repairman: true,
            user: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        });
      }
      return orders.map((order) => OrderReponseDto.formatDto(order));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createDiagnosises(dto: DiagnosisRequestDto[], repairmanId: string) {
    if (!Array.isArray(dto) || dto.length === 0) {
      throw new BadRequestException(
        'Diagnosises list muse have at least one diagnosis',
      );
    }
    try {
      const { orderDetailId } = dto[0];
      const isValidDiagnosisList = dto.every(
        (dia) => dia.orderDetailId === orderDetailId,
      );
      if (!isValidDiagnosisList) {
        throw new BadRequestException(
          'There are more than one orderdetail in this list',
        );
      }
      const existedOrderDetail = await this.prisma.orderDetail.findUnique({
        where: {
          orderDetailId,
        },
        include: {
          order: true,
        },
      });

      if (!existedOrderDetail) {
        throw new NotFoundException('Order detail is not found');
      }

      if (repairmanId !== existedOrderDetail.order.repairmanId) {
        throw new ForbiddenException(
          'You are not permitted to make change for this order',
        );
      }

      const priceList = await Promise.all(
        dto.map(async (dia) => {
          const malfunc = await this.prisma.malfunctionCategory.findUnique({
            where: {
              malfuncId: dia.malfuncId,
            },
          });

          if (!malfunc) return 0;
          return malfunc.price;
        }),
      );

      const addTotal = priceList.reduce((sum: number, val) => {
        return (sum += parseInt(val.toString()));
      }, 0);

      const diagnosises = await this.prisma.diagnosis.findMany({
        where: {
          orderDetailId,
        },
        include: {
          malfunction: true,
        },
      });
      let subTotal = 0;
      if (Array.isArray(diagnosises) && diagnosises.length > 0) {
        subTotal = diagnosises.reduce((sum: number, dia) => {
          return (sum += parseInt(dia.malfunction.price.toString()));
        }, 0);

        await this.prisma.order.update({
          where: {
            orderId: existedOrderDetail.orderId,
          },
          data: {
            total:
              parseInt(existedOrderDetail.order.total.toString()) - subTotal,
          },
        });

        await this.prisma.diagnosis.deleteMany({
          where: {
            orderDetailId,
          },
        });
      }

      await this.prisma.diagnosis.createMany({
        data: dto,
      });

      await this.prisma.order.update({
        where: {
          orderId: existedOrderDetail.orderId,
        },
        data: {
          total:
            parseInt(existedOrderDetail.order.total.toString()) +
            addTotal -
            subTotal,
        },
      });

      return { result: 'success' };
    } catch (error) {
      throw error;
    }
  }

  async createComponents(dto: ComponentRequestDto[], repairmanId: string) {
    if (!Array.isArray(dto) || dto.length === 0) {
      throw new BadRequestException(
        'Components list must have at least one component',
      );
    }
    try {
      const { orderId } = dto[0];
      const existedOrder = await this.prisma.order.findUnique({
        where: {
          orderId: orderId,
        },
      });

      if (!existedOrder) {
        throw new NotFoundException('Order is not found');
      }

      if (repairmanId !== existedOrder.repairmanId) {
        return new ForbiddenException(
          'You are not permitted to make change for this order',
        );
      }

      const components = await this.prisma.component.findMany({
        where: {
          orderId,
        },
      });
      console.log({ components });
      let subTotal = 0;
      if (Array.isArray(components) && components.length > 0) {
        subTotal = components.reduce((sum, comp) => {
          return (sum += comp.pricePerUnit * comp.quantity);
        }, 0);

        await this.prisma.order.update({
          where: {
            orderId: dto[0].orderId,
          },
          data: {
            total: parseInt(existedOrder.total.toString()) - subTotal,
          },
        });

        await this.prisma.component.deleteMany({
          where: {
            orderId: dto[0].orderId,
          },
        });
      }

      await this.prisma.component.createMany({
        data: dto,
      });

      const total = dto.reduce((sum, comp) => {
        return (sum += comp.pricePerUnit * comp.quantity);
      }, 0);

      await this.prisma.order.update({
        data: {
          total: total + parseInt(existedOrder.total.toString()) - subTotal,
        },
        where: {
          orderId,
        },
      });

      return {
        result: 'success',
      };
    } catch (error) {
      throw error;
    }
  }

  async updateIncurCost(dto: UpdateIncurredCost, repairmanId: string) {
    try {
      const { orderId } = dto;
      const existedOrder = await this.prisma.order.findUnique({
        where: {
          orderId,
        },
      });

      if (!existedOrder) {
        throw new NotFoundException('Order is not found');
      }

      if (existedOrder.repairmanId !== repairmanId) {
        throw new ForbiddenException('You are not permitted');
      }

      const order = await this.prisma.order.update({
        where: {
          orderId,
        },
        data: {
          incurredCost: dto.incurredCost,
          incurredCostReason: dto.incurredCostReason,
          total: parseInt(existedOrder.total.toString()) - dto.incurredCost,
        },
      });

      return OrderReponseDto.formatDto(order);
    } catch (error) {
      throw error;
    }
  }

  async assignOrder(orderId: number, repairmanId: string) {
    try {
      await this.prisma.order.update({
        where: {
          orderId,
        },
        data: {
          repairmanId,
        },
      });

      return {
        message: 'Assign repairman for order successfully',
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: number, status: number) {
    try {
      const order = await this.prisma.order.update({
        where: {
          orderId,
        },
        data: {
          status,
        },
      });
      return order;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async generateQrInfo(orderId: number, userId: string) {
    try {
      const existedOrder = await this.prisma.order.findUnique({
        where: {
          orderId,
        },
      });

      if (!existedOrder) {
        return new NotFoundException('Order is not found');
      }

      if (userId !== existedOrder.userId) {
        return new ForbiddenException('You are not permitted to get this info');
      }

      if (existedOrder.status !== OrderStatus.ACCEPTED) {
        return new ForbiddenException('Can not generate token for this order');
      }

      const payload = {
        orderId,
        repairmanId: existedOrder.repairmanId,
      };
      const secret = this.config.get('JWT_SECRET');
      const orderDecoded = await this.jwtService.signAsync(payload, {
        expiresIn: '1d',
        secret: secret,
      });

      return orderDecoded;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async checkInOrder(repairmanId: string, token: string) {
    try {
      const payload: any = this.jwtService.decode(token);
      if (repairmanId !== payload.repairmanId) {
        return new ForbiddenException(
          'You are not permitted to change this asset',
        );
      }

      const existedOrder = await this.prisma.order.findUnique({
        where: {
          orderId: payload.orderId,
        },
      });

      if (!existedOrder) return false;

      if (existedOrder.repairmanId !== repairmanId) return false;

      await this.updateOrderStatus(payload.orderId, OrderStatus.CHECKEDIN);

      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllPendingOrderToAssign() {
    try {
      const orders = await this.prisma.order.findMany({
        where: {
          status: OrderStatus.PENDING,
          repairman: null,
        },
        include: {
          address: true,
          orderDetails: {
            include: {
              service: true,
            },
          },
        },
      });
      if (Array.isArray(orders) && orders.length > 0) {
        orders.forEach((order) => {
          const data = {
            orderId: order.orderId.toString(),
            skills: order.orderDetails.map((detail) => detail.service.skillId),
            coordinate:
              order.address.latitude !== null &&
              order.address.longitude !== null
                ? {
                    latitude: order.address.latitude,
                    longitude: order.address.longitude,
                  }
                : null,
          };

          this.addOrderToQueue(data);
        });
      }
      return orders;
    } catch (error) {
      throw error;
    }
  }

  async createMultiOrders(dto: OrderRequestDto[]) {
    try {
      const orderIdList = [];
      if (Array.isArray(dto) && dto.length > 0) {
        Promise.all(
          dto.map(async (order) => {
            const createdOrder = await this.createOrder(order, order.userId);
            orderIdList.push(createdOrder.orderId);
          }),
        );
      }
      return {
        orderIdList,
      };
    } catch (error) {
      throw error;
    }
  }

  async getStatistic(query: any) {
    const { from, to, type } = query;
    try {
      if (!(type in StatisticType)) {
        return new BadRequestException('Loại thồng kê không tồn tại');
      }

      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (fromDate < toDate) {
        throw new BadRequestException('Ngày thống kê không hợp lệ');
      }

      const statistic: any = [];
      while (fromDate <= toDate) {
        const current = fromDate;
        const nextDate = new Date(
          `${current.getFullYear()}-${current.getMonth()}-${current.setDate(
            current.getDate() + 1,
          )}`,
        );
        const orders = await this.prisma.order.findMany({
          where: {
            AND: [
              {
                updatedAt: {
                  gte: current,
                },
              },
              {
                updatedAt: {
                  lt: nextDate,
                },
              },
            ],
            status: OrderStatus.COMPLETE,
          },
          include: {
            orderDetails: {
              include: {
                service: true,
              },
            },
            repairman: true,
          },
        });

        const value = {
          date: current.toLocaleDateString(),
          data: orders,
        };

        statistic.push(value);
      }

      return statistic;
    } catch (error) {
      throw error;
    }
  }

  async updateOrderStatusByRepairman(
    orderId: number,
    status: number,
    repairmanId: string,
  ) {
    if (status !== 0 && status !== 1 && status !== 2) {
      return new BadRequestException('Unsupported Status');
    }
    try {
      const order = await this.prisma.order.findUnique({
        where: {
          orderId: orderId,
        },
      });

      if (!order) return new NotFoundException('Order did not exist');

      if (order.repairmanId !== repairmanId)
        return new ForbiddenException('You do not have permission');

      if (status === 0) {
        await this.prisma.order.update({
          where: {
            orderId: orderId,
          },
          data: {
            repairmanId: null,
          },
        });

        return;
      }

      if (status === 1) {
        await this.prisma.order.update({
          where: {
            orderId: orderId,
          },
          data: {
            status: OrderStatus.ACCEPTED,
          },
        });
        return;
      }
      if (status === 2) {
        await this.prisma.order.update({
          where: {
            orderId: orderId,
          },
          data: {
            status: OrderStatus.COMPLETE,
          },
        });

        return;
      }
      return;
    } catch (error) {
      throw error;
    }
  }

  async checkOrders() {
    try {
      const currentTime = new Date();
      const thirtyMinutesAgo = new Date(currentTime.getTime() - 5 * 60000);
      const pendingOrders = await this.prisma.order.findMany({
        where: {
          status: OrderStatus.PENDING,
          NOT: {
            repairmanId: null,
          },
          updatedAt: {
            gte: thirtyMinutesAgo,
          },
        },
        include: {
          orderDetails: {
            include: {
              service: true,
            },
          },
          address: true,
        },
      });

      if (Array.isArray(pendingOrders) && pendingOrders.length > 0) {
        await Promise.all(
          pendingOrders.map(async (order) => {
            await this.prisma.user.update({
              where: {
                userId: order.repairmanId,
              },
              data: {
                status: UserStatus.BUSY,
              },
            });
            await this.prisma.order.update({
              where: {
                orderId: order.orderId,
              },
              data: {
                repairmanId: null,
              },
            });
            if (
              order.address.latitude !== null &&
              order.address.latitude !== undefined
            ) {
              const orderData: {
                orderId: string;
                skills: number[];
                coordinate: Coordinate;
              } = {
                orderId: order.orderId.toString(),
                skills: order.orderDetails.map(
                  (detail) => detail.service.skillId,
                ),
                coordinate: {
                  latitude: order.address.latitude,
                  longitude: order.address.longitude,
                },
              };
              console.log('reassign order: ', order.orderId);
              this.addOrderToQueue(orderData);
            }
          }),
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
