import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Role } from 'src/enum/role';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    console.log(user);
    // return requireRoles.some((role) => user.roles?.includes(role));
    return user && user.role === Role.ROLE_ADMIN;
  }
}
