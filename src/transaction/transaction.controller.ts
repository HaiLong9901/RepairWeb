import { Controller, Get, Req, Res, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('transaction')
@ApiTags('Payment')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}
  @Get('payment')
  async redirectToVnpay(@Req() req, @Res() res: Response) {
    const orderId = 'YOUR_UNIQUE_ORDER_ID';
    const amount = 100000;
    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const secureUrl = await this.transactionService.generatePaymentUrl(
      orderId,
      amount,
      ipAddr,
    );
    return res.redirect(secureUrl);
  }

  @Post('callback')
  async handleVnpayCallback(@Req() req, @Res() res: Response): Promise<void> {
    const isValidTransaction = this.transactionService.confirmTransaction(
      req.body,
    );

    // Xử lý dữ liệu callback từ VNPAY
    if (isValidTransaction) {
      // Giao dịch hợp lệ, thực hiện xử lý của bạn ở đây
      res.send('Transaction confirmed. Thank you!');
    } else {
      // Giao dịch không hợp lệ
      res.status(400).send('Invalid transaction');
    }
  }
}
