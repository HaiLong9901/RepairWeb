import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { NotificationModule } from 'src/notification/notification.module';
import { OrderGateway } from './order.gateway';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [OrderService, OrderGateway],
  controllers: [OrderController],
  imports: [NotificationModule, UserModule, AuthModule, NotificationModule],
})
export class OrderModule {}
