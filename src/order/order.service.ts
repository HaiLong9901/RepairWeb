import {
  ForbiddenException,
  Injectable,
  NotFoundException,
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

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async createOrder(dto: OrderRequestDto, userId: string) {
    try {
      const order = await this.prisma.order.create({
        data: {
          userId: userId,
          code: userId.slice(3, 10) + Date.now(),
          expectDate: dto.expectDate,
          status: OrderStatus.PENDING,
          addressId: dto.addressId,
        },
      });

      const orderDetails = await Promise.all(
        dto.orderDetail.map(
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

      await Promise.all(
        orderDetails.map(
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

      //   const orderDetailResponse = orderDetails.map(value => {
      //     return {
      //         orderDetailId: value.orderDetailId,
      //         orderId: value.orderId,
      //         serviceId: value.serviceId,
      //         desc: value.desc,
      //         media: media.filter(val => )
      //     }
      //   })

      //   const response: OrderRequestDto = {
      //     orderId: parseInt(order.orderId.toString()),
      //     code: order.code,
      //     status: OrderStatus.PENDING,
      //     expectDate: order.expectDate,
      //     userId: order.userId,
      //     repairmanId: null,
      //     orderDetail: orderDetail,
      //   };

      return {
        message: 'create successful',
      };
    } catch (error) {
      console.log(error);
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
            },
          },
          repairman: true,
          address: true,
        },
      });

      if (user.role === Role.ROLE_USER && user.userId !== order.userId) {
        return new ForbiddenException(
          'You are not permited to access this data',
        );
      }

      return formatBigInt(order);
    } catch (error) {
      console.log(error);
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
        gte: from,
        lte: to,
      };
    }

    let searchStatus = {};
    if (status) {
      searchStatus = {
        status,
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
          components: true,
          address: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        ...pagination,
      });

      return formatBigInt(orders);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOrdersByUserId(user: User, query: any, orderUserId: string) {
    const { userId, role } = user;
    const { status } = query;
    if (userId !== orderUserId && role === Role.ROLE_USER) {
      throw new ForbiddenException(
        'You are not permitted to access this asset',
      );
    }
    try {
      let orders = [];
      if (status) {
        orders = await this.prisma.order.findMany({
          where: {
            userId,
            status,
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
                media: true,
                service: true,
                diagnosis: true,
              },
            },
            repairman: true,
            user: true,
            components: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        });
      }
      return orders;
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
      await this.prisma.order.update({
        where: {
          orderId,
        },
        data: {
          status,
        },
      });
    } catch (error) {}
  }
}
