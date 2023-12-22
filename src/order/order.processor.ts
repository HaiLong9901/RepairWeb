import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';

@Processor('orderQueue')
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  @Process('processOrder')
  async processOrder(order: any): Promise<void> {
    console.log('process');
    this.logger.debug(`Processing order: `, order.toString());
  }
}
