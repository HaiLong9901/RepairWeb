import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { OrderService } from './order.service';
import { Logger } from '@nestjs/common';
import { NotificationRequestDto } from 'src/notification/dto/request.dto';
import { NotificationService } from 'src/notification/notification.service';
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
  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private notificationService: NotificationService,
  ) {}

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

  @SubscribeMessage('getAllMessages')
  async getAllMessage(client: Socket) {
    this.logger.log(this.Messages.join('\n'));
    return this.Messages.join('\n');
  }

  @SubscribeMessage('repairmanCheckin')
  async checkIn(client: Socket, payload: NotificationRequestDto) {
    this.notificationService.createNotification(payload);
    this.logger.log(
      await this.notificationService.getAllNotification('CUS49876336'),
    );
    this.server.sockets.emit(
      'notifications',
      await this.notificationService.getAllNotification('CUS49876336'),
    );
    return payload;
  }
}
