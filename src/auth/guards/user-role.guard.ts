import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { User } from 'src/users/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class UserRoleGuard implements CanActivate {
  private constructor(private readonly reflector: Reflector) {}

  public canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles) return true;

    if (validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest<Request>();

    const user = req.user as User;

    if (!user) throw new BadRequestException('User not found');

    if (validRoles.includes(user.rol)) {
      return true;
    }

    throw new ForbiddenException(
      `You need a valid role to access this resource`,
    );
  }
}
