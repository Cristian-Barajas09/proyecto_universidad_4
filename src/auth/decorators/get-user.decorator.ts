import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();

    const user = req.user;

    if (!user) {
      throw new InternalServerErrorException('User not found (request)');
    }

    if (!data) return user;

    // Solo retorna si la propiedad existe y no es una función
    if (
      Object.prototype.hasOwnProperty.call(user, data) &&
      typeof user[data] !== 'function'
    ) {
      return user[data];
    }

    throw new InternalServerErrorException(
      `Property ${data} not found in user or is not accessible`,
    );
  },
);
