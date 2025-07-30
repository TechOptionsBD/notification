import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UserAgent } from 'src/decorators/user-agent.decorator';
import { User, UserType } from 'src/decorators/user.decorator';
import { Platform } from 'src/modules/broker/enums';
import { CreateUserTokenDto } from '../dtos/create-user-token';
import { UserTokenResponseDto } from '../serializers/user-token.response.dto';
import { UserTokenService } from '../services/user-token.service';

@UseGuards(AuthGuard)
@Serialize(UserTokenResponseDto)
@Controller('user-token')
export class UserTokenController {
  constructor(private service: UserTokenService) {}

  @Post('/')
  public async create(
    @Body() body: CreateUserTokenDto,
    @User() user: UserType,
    @UserAgent() platform: Platform,
  ) {
    const token = await this.service.createOrUpdate(body, user, platform);
    return {
      message: 'User Token created successfully.',
      data: token,
    };
  }
}
