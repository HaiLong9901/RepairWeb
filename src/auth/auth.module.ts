import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { OtpModule } from 'src/otp/otp.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [JwtModule.register({}), OtpModule, MailModule],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
