import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OrderService } from './order.service';
import { Logger, UseGuards } from '@nestjs/common';
import { RepairmanSocketGuard } from 'src/auth/guard/repairmanSocket.guard';
import { User } from '@prisma/client';
@WebSocketGateway(3006, {
  cors: {
    origin: '*',
  },
})
export class OrderGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('OrderGateWay');
  private Messages: string[] = [];
  constructor(private orderService: OrderService) {}

  afterInit(server: any) {
    this.logger.log(server, 'Init');
  }

  async handleConnection(client: Socket) {
    this.logger.log(
      parseInt(client.id),
      'Connected..................................',
    );
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(
      parseInt(client.id),
      'Disconnect...............................',
    );
  }

  @SubscribeMessage('messages')
  async messages(client: Socket, payload: string) {
    this.logger.log(client.id, payload);
    this.Messages.push(payload);
    client.send(payload);
    this.server.sockets.emit('receive_message', this.Messages.join('\n'));
    return payload;
  }

  @SubscribeMessage('getOrderDetail')
  async getOrderDetail(client: Socket, orderId: number) {
    const user: User = client.data;
    try {
      const order = await this.orderService.getOrderById(orderId, user);

      this.server.sockets.emit(`orderInfo/:${orderId}`, order);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @SubscribeMessage('repairmanCheckin')
  @UseGuards(RepairmanSocketGuard)
  async checkIn(client: Socket, payload: string) {
    const repairman = client.data;
    try {
      const order: any = await this.orderService.checkInOrder(
        repairman.userId,
        payload,
      );

      this.server.sockets.emit(`orderInfo/:${order.orderId}`, order);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
