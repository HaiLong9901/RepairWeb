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
import { SeriveModule } from './serive/serive.module';
import { ServiceService } from './service/service.service';
import { ServiceController } from './service/service.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    PrismaModule,
    OtpModule,
    AddressModule,
    SkillModule,
    SeriveModule,
  ],
  controllers: [AppController, ServiceController],
  providers: [AppService, ServiceService],
})
export class AppModule {}
