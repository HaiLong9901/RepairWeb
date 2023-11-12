import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { NotificationModule } from 'src/notification/notification.module';
import { OrderGateway } from './order.gateway';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [OrderService, OrderGateway],
  controllers: [OrderController],
  imports: [
    NotificationModule,
    UserModule,
    AuthModule,
    NotificationModule,
    JwtModule,
  ],
})
export class OrderModule {}
