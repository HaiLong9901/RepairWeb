import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  providers: [OrderService],
  controllers: [OrderController],
  imports: [NotificationModule],
})
export class OrderModule {}
