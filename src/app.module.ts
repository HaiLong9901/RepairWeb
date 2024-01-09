import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { OtpModule } from './otp/otp.module';
import { AddressModule } from './address/address.module';
import { SkillModule } from './skill/skill.module';
import { ServiceService } from './service/service.service';
import { ServiceController } from './service/service.controller';
import { ReviewModule } from './review/review.module';
import { OrderModule } from './order/order.module';
import { MalfunctionModule } from './malfunction/malfunction.module';
import { NotificationModule } from './notification/notification.module';
import { MailModule } from './mail/mail.module';
import { CartModule } from './cart/cart.module';
import { SystemConfigModule } from './system-config/system-config.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    PrismaModule,
    OtpModule,
    AddressModule,
    SkillModule,
    ReviewModule,
    OrderModule,
    MalfunctionModule,
    NotificationModule,
    MailModule,
    CartModule,
    SystemConfigModule,
    TransactionModule,
  ],
  controllers: [AppController, ServiceController],
  providers: [AppService, ServiceService],
})
export class AppModule {}
