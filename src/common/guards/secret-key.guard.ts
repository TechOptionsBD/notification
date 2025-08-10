import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecretKeyGuard implements CanActivate {
  constructor(private config: ConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const requestedKey = req.headers['secret-key'];
    if (!requestedKey)
      throw new UnauthorizedException('Secret key were not provided.');

    const secretKey = this.config.get('secretKey');
    if (secretKey !== requestedKey)
      throw new BadRequestException('Invalid secret key provided.');
    return true;
  }
}
