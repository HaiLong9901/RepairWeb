import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { VNPay, VnpCurrCode, VnpLocale } from 'vnpay';
@Injectable()
export class TransactionService {
  private vnpay: VNPay;
  constructor(private prisma: PrismaService) {
    this.vnpay = new VNPay({
      api_Host: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      tmnCode: 'T4UA3LUN',
      secureSecret: 'MIGSGTDWSYWVWHPTYPBJCQZKUXICKSQY',
    });
  }

  async generatePaymentUrl(
    orderId: string,
    amount: number,
    ipAddress: string,
  ): Promise<string> {
    const returnUrl = 'http://localhost:3000/transaction/callback';

    const params = {
      vnp_Amount: amount * 100,
      vnp_Command: 'pay',
      vnp_CreateDate: new Date().getTime(),
      vnp_CurrCode: VnpCurrCode.VND,
      vnp_IpAddr: ipAddress,
      vnp_Locale: VnpLocale.VN,
      vnp_OrderInfo: 'Payment for order ' + orderId,
      vnp_OrderType: 'billpayment',
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: orderId,
      vnp_Version: '2.0.0',
    };

    console.log({ params });

    const secureUrl = this.vnpay.buildPaymentUrl(params);

    // console.log({ secureUrl });
    return secureUrl;
  }

  async confirmTransaction(req: any) {
    const isValid = this.vnpay.verifyReturnUrl(req);
    return isValid;
  }
}
