import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  // UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CancelOrderRequestDto,
  ComponentRequestDto,
  DiagnosisRequestDto,
  OrderRequestDto,
  // UpdateOrderStatusRequestDto,
} from './dto/request.dto';
import { OrderStatus } from 'src/enum/order-status.enum';
import { User } from '@prisma/client';
import { Role } from 'src/enum/role';
import { formatBigInt } from 'src/utils/formatResponse';
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
    setTimeout(() => {
      this.updateInterval(OrderService.intervalDur);
    }, 5000);
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
        }),
      );

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

  async createDiagnosis(dto: DiagnosisRequestDto, repairmanId: string) {
    try {
      const { orderDetailId, malfuncId } = dto;
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

      const existedMalfunction =
        await this.prisma.malfunctionCategory.findUnique({
          where: {
            malfuncId,
          },
        });

      if (!existedMalfunction) {
        throw new NotFoundException('Malfunction is not found');
      }

      const diagnosis = await this.prisma.diagnosis.create({
        data: {
          orderDetailId,
          malfuncId,
          isAccepted: false,
        },
      });

      return formatBigInt(diagnosis);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteDiagnosis(diagnosisId: number) {
    try {
      const existedDiagnosis = await this.prisma.diagnosis.findUnique({
        where: {
          diagnosisId,
        },
      });

      if (!existedDiagnosis) {
        throw new NotFoundException('Diagnosis is not found');
      }

      await this.prisma.diagnosis.delete({
        where: {
          diagnosisId,
        },
      });

      return {
        message: 'Delete diagnosis successfully',
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async toggleAcceptDiagnosis(diagnosisId: number, userId: string) {
    try {
      const existedDiagnosis = await this.prisma.diagnosis.findUnique({
        where: {
          diagnosisId,
        },
        include: {
          orderDetail: {
            include: {
              order: true,
            },
          },
          malfunction: true,
        },
      });

      if (!existedDiagnosis) {
        return new ForbiddenException('Diagnosis is not found');
      }

      if (existedDiagnosis.orderDetail.order.userId !== userId) {
        throw new ForbiddenException(
          'You are not permitted to make changes for this order',
        );
      }

      const updatedDiagnosis = await this.prisma.diagnosis.update({
        where: {
          diagnosisId,
        },
        data: {
          isAccepted: existedDiagnosis.isAccepted ? false : true,
        },
      });
      const orderTotal = existedDiagnosis.orderDetail.order.total;
      const diagnosisPrice = existedDiagnosis.malfunction.price;
      await this.prisma.order.update({
        where: {
          orderId: existedDiagnosis.orderDetail.order.orderId,
        },
        data: {
          total: updatedDiagnosis.isAccepted
            ? orderTotal + diagnosisPrice
            : orderTotal - diagnosisPrice,
        },
      });

      return {
        message: 'Accept/UnAccept successfully',
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createComponent(dto: ComponentRequestDto, repairmanId: string) {
    try {
      const existedOrder = await this.prisma.order.findUnique({
        where: {
          orderId: dto.orderId,
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

      const component = this.prisma.component.create({
        data: {
          ...dto,
        },
      });

      return formatBigInt(component);
    } catch (error) {}
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

      const order = await this.updateOrderStatus(
        payload.orderId,
        OrderStatus.CHECKEDIN,
      );

      if (order)
        return {
          result: true,
        };

      return {
        result: false,
      };
      return order;
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

  // async autoAssignOrder() {
  //   try {
  //     const orderList = await this.getAllPendingOrderToAssign();
  //     const repairmans = await this.prisma.user.findMany({
  //       where: {
  //         NOT: {
  //           status: UserStatus.BUSY,
  //         },
  //         role: Role.ROLE_REPAIRMAN,
  //       },
  //       include: {
  //         address: true,
  //       },
  //     });
  //     if (orderList.length === 0) return;
  //     orderList.forEach(async (order) => {
  //       if (
  //         order.address &&
  //         order.address.latitude &&
  //         order.address.longitude
  //       ) {
  //         const suitableRepairmans = repairmans.filter((repairman) => {
  //           if (
  //             !repairman.address ||
  //             !repairman.address[0].latitude ||
  //             !repairman.address[0].longitude
  //           )
  //             return false;
  //           const repairmanCordinate: Coordinate = {
  //             latitude: repairman.address[0].latitude,
  //             longitude: repairman.address[0].longitude,
  //           };

  //           const orderCordinate: Coordinate = {
  //             latitude: order.address.latitude,
  //             longitude: order.address.longitude,
  //           };

  //           return getDistance(repairmanCordinate, orderCordinate) < 5;
  //         });

  //         if (
  //           Array.isArray(suitableRepairmans) &&
  //           suitableRepairmans.length > 0
  //         ) {
  //           suitableRepairmans.forEach(
  //             async (rpm) =>
  //               await this.assignOrder(
  //                 parseInt(order.orderId.toString()),
  //                 rpm.userId,
  //               ),
  //           );
  //         }
  //       }
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async statisticOrderByDay(from: string, to: string) {
  //   try {
  //     const orders = await this.prisma.order.findMany({
  //       where: {
  //         updatedAt: {
  //           gte: new Date(from),
  //           lte: new Date(to),
  //         },
  //       },
  //       include: {
  //         repairman: true,
  //         orderDetails: {
  //           include: {
  //             service: true,
  //           },
  //         },
  //       },
  //     });
  //     const ordersFilterByStatus = Object.keys(OrderStatus).map((key) => {
  //       const orderList = orders.filter(
  //         (order) => order.status === OrderStatus[`${key}`],
  //       );
  //       const orderRes = {
  //         status: key,
  //         orderList,
  //       };

  //       return orderRes;
  //     });

  //     const dailyOutcomeList = orders
  //       .filter((order) => order.status === OrderStatus.COMPLETE)
  //       .map((order) => {

  //       });
  //   } catch (error) {}
  // }

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
}
