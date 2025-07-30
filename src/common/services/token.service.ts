import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  public async validate(token: string): Promise<any> {
    if (!token) {
      throw new UnauthorizedException('Authorization token is required');
    }

    const userServiceUrl = this.configService.get<string>('userService');
    if (!userServiceUrl) {
      throw new Error('User service URL is not configured');
    }

    const headers = { Authorization: token };

    try {
      const response = await lastValueFrom(
        this.httpService.get(`${userServiceUrl}/users/validate-token`, {
          headers,
        }),
      );

      const user = response?.data?.data?.user;
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Token validation failed: ${error.message}`,
        error.stack,
      );

      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw new HttpException(
          {
            message: error.response.data?.message || 'Authentication failed',
            error: error.response.data?.error,
          },
          error.response.status,
        );
      }

      throw new HttpException(
        { message: 'Internal server error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
