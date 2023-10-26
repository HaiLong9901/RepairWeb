import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  OrderRequestDto,
  UpdateOrderStatusRequestDto,
} from './dto/request.dto';
import { OrderStatus } from 'src/enum/order-status.enum';
import { User } from '@prisma/client';
import { Role } from 'src/enum/role';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(dto: OrderRequestDto, userId: string) {
    try {
      const order = await this.prisma.order.create({
        data: {
          userId: userId,
          code: dto.userId.slice(3, 10) + Date.now(),
          expectDate: dto.expectDate,
          status: OrderStatus.PENDING,
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

  async updateOrderStatus(user: User, dto: UpdateOrderStatusRequestDto) {
    const { userId, role } = user;
    const { status } = dto;

    if (role === Role.ROLE_USER && status !== OrderStatus.REJECTED) {
    }
    try {
    } catch (error) {}
  }
}
