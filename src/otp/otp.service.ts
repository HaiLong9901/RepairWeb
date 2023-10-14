import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}
  async generateOtp(userId: string) {
    const otpLength = 6;
    let otp = '';
    for (let i = 0; i < otpLength; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    try {
      const otpForUser = await this.prisma.otp.create({
        data: {
          userId: userId,
          code: otp,
          expireAt: new Date(),
        },
      });

      return otpForUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async verifyOtp(userId: string, otp: string) {
    try {
      const foundOtp = await this.prisma.otp.findFirst({
        where: {
          code: otp,
          userId: userId,
        },
      });

      if (!foundOtp) {
        throw new NotFoundException('Mã xác thực không chính xác');
      }

      if (new Date(foundOtp.expireAt) < new Date()) {
        throw new ForbiddenException('Mã xác thực đã hết hạn');
      }

      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async sendOtp(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new NotFoundException('Email không tồn tại');
      }

      const otp = await this.generateOtp(user.userId);
      return otp;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
