import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationRequestDto } from './dto/request.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createNotification(dto: NotificationRequestDto) {
    try {
      await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          content: dto.content,
          isSeen: false,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllNotification(userId: string) {
    try {
      const notification = await this.prisma.notification.findMany({
        where: {
          userId,
          isSeen: false,
        },
      });

      return notification;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateNotification(notificationId: number) {
    try {
      const existedNotificaiton = await this.prisma.notification.findUnique({
        where: {
          notificationId,
        },
      });
      if (!existedNotificaiton) {
        throw new NotFoundException('Notification is not found');
      }

      await this.prisma.notification.update({
        data: {
          isSeen: true,
        },
        where: {
          notificationId,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
