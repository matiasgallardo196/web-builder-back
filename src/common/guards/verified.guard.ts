import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { User } from '../../modules/users/entities/user.entity';

@Injectable()
export class VerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<{ user: User }>();

    if (!user.isVerified) {
      throw new ForbiddenException('Your account is not verified. Please contact an administrator.');
    }

    return true;
  }
}
