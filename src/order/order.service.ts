import {
  ForbiddenException,
  Injectable,
  // UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  OrderRequestDto,
  // UpdateOrderStatusRequestDto,
} from './dto/request.dto';
import { OrderStatus } from 'src/enum/order-status.enum';
import { User } from '@prisma/client';
import { Role } from 'src/enum/role';
import { formatBigInt } from 'src/utils/formatResponse';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

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

  // async cancelOrder(user: User, dto: UpdateOrderStatusRequestDto) {
  //   const { userId, role } = user;
  //   const { status } = dto;

  //   if (role === Role.ROLE_USER && status !== OrderStatus.REJECTED) {
  //     return new ForbiddenException(
  //       'You are not permited to change this status',
  //     );
  //   }

  //   // if (role === Role.ROLE_REPAIRMAN) {
  //   //   if (status === OrderStatus)
  //   // }
  //   try {
  //   } catch (error) {}
  // }

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

  async getAllOrder(req: any) {
    const { from, to, status, repairmanId } = req;
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
      });

      return formatBigInt(orders);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOrdersByUserId(user: User, req: any, orderUserId: string) {
    const { userId, role } = user;
    const { status } = req;
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
}
