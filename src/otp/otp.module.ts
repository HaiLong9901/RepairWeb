import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { MailModule } from 'src/mail/mail.module';
import { CartModule } from 'src/cart/cart.module';

@Module({
  providers: [OtpService],
  exports: [OtpService],
  imports: [MailModule, CartModule],
})
export class OtpModule {}
