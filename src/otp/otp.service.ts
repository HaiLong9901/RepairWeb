import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { CartService } from 'src/cart/cart.service';
import { UserStatus } from 'src/enum/user-status';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class OtpService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private cartService: CartService,
  ) {}

  async generateOtp(user: User) {
    const otpLength = 6;
    let otp = '';
    for (let i = 0; i < otpLength; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    const expireAt = new Date();
    expireAt.setMinutes(expireAt.getMinutes() + 1);
    try {
      const otpForUser = await this.prisma.otp.create({
        data: {
          userId: user.userId,
          code: otp,
          expireAt,
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
          expireAt: {
            gte: new Date(),
          },
        },
      });

      if (!foundOtp) {
        throw new NotFoundException('OTP is incorrect or expired');
      }

      await this.prisma.user.update({
        where: {
          userId,
        },
        data: {
          status: UserStatus.ACTIVE,
        },
      });
      const existedCart = this.prisma.cart.findUnique({
        where: {
          userId,
        },
      });

      if (!existedCart) {
        await this.cartService.createCart(userId);
      }
    } catch (error) {
      throw error;
    }
  }

  async sendOtp(user: User) {
    try {
      const otp = await this.generateOtp(user);
      await this.mailService.sendUserOtp(user, otp.code);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
