import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  //   private orderQueue: Queue;

  constructor(@InjectQueue('orderQueue') private orderQueue: Queue) {
    // this.orderQueue = new Queue('orderQueue', {
    //   limiter: {
    //     max: 1, // Số lượng công việc tối đa có thể xử lý cùng một lúc
    //     duration: 5000, // Thời gian giữa mỗi lần xử lý (5 phút)
    //   },
    // });
  }

  async addOrderToQueue(orderData: any): Promise<void> {
    await this.orderQueue.add('processOrder', orderData, {
      delay: 5000, // Thời gian trễ trước khi bắt đầu xử lý (5 phút)
    });
  }
}
