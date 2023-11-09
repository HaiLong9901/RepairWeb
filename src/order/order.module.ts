import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { NotificationModule } from 'src/notification/notification.module';
import { OrderGateway } from './order.gateway';

@Module({
  providers: [OrderService, OrderGateway],
  controllers: [OrderController],
  imports: [NotificationModule],
})
export class OrderModule {}
