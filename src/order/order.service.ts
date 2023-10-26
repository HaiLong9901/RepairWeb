import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderRequestDto } from './dto/request.dto';

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
          status: 0,
        },
      });

      const orderDetail = await this.prisma.orderDetail.createMany({
        data: dto.orderDetail.map((od) => {
          return {
            ...od,
            orderId: order.orderId,
          };
        }),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
