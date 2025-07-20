// src/auth/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@/users/user.entity';

export const GetUser = createParamDecorator((field: keyof User | undefined, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<Request & { user: User }>();
  const user = req.user;
  return field ? user[field] : user;
});
