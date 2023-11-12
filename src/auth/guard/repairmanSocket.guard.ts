import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { Role } from 'src/enum/role';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RepairmanSocketGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean | any | Promise<boolean | any>> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const userToken = client.handshake.headers.authorization;
    try {
      const decoded = this.jwtService.decode(userToken);
      const user = await this.prisma.user.findUnique({
        where: {
          userId: decoded.sub,
        },
      });
      delete user.password;
      client.data = user;
      if (user.role !== Role.ROLE_REPAIRMAN) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
