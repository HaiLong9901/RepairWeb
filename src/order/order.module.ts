import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { NotificationModule } from 'src/notification/notification.module';
import { OrderGateway } from './order.gateway';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bull';
import { OrderProcessor } from './order.processor';
import { Queue } from './Queue';

@Module({
  providers: [OrderService, OrderGateway, OrderProcessor, Queue],
  controllers: [OrderController],
  imports: [
    NotificationModule,
    UserModule,
    AuthModule,
    NotificationModule,
    JwtModule,
    BullModule.forRoot('alternative-config', {
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      configKey: 'alternative-config',
      name: 'orderQueue',
    }),
  ],
})
export class OrderModule {}
