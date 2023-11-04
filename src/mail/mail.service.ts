import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserOtp(user: User, otp: string) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Chào mừng đến với NiceRepair, đây là mã xác thực của bạn',
        template: './confirmation.hbs',
        context: {
          name: user.firstName,
          otp: otp,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async confirmOder(user: User) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Chào mừng đến với NiceRepair, đây là mã xác thực của bạn',
        template: './confirmation.hbs',
        context: {
          name: user.firstName,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
