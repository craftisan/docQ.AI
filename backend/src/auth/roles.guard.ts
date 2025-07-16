import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/auth/roles.decorator';
import { User } from '@/users/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest<Request & { user: User }>();
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException("You don't have appropriate permissions");
    }
    return true;
  }
}
