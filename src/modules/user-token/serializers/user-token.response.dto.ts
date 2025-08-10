import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserType } from 'src/decorators/user.decorator';

export class UserTokenResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty()
  @Expose()
  @Type(() => UserType)
  user: UserType;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  web: string;

  @ApiProperty()
  @Expose()
  android: string;

  @ApiProperty()
  @Expose()
  ios: string;
}
