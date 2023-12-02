import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Role } from 'src/enum/role';

@Injectable()
export class CustomerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    return user && user.role === Role.ROLE_USER;
  }
}
