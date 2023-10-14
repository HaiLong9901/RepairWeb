import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  imports: [JwtModule.register({}), OtpModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
