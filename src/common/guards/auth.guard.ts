import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from 'src/common/services/token.service';
import { UserType } from 'src/decorators/user.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (!req.headers['authorization'])
      throw new UnauthorizedException(
        'Authentication credentials were not provided.',
      );
    const token = req.headers['authorization'];
    const user: UserType = await this.tokenService.validate(token);
    req.user = {
      userId: user.userId,
      phone: user.phone,
      email: user.email,
      fullName: user.fullName,
      gender: user.gender,
      role: user.role,
      profilePicture: user.profilePicture,
    };
    return true;
  }
}
