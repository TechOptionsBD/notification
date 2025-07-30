import { Expose, Type } from 'class-transformer';
import { UserType } from 'src/decorators/user.decorator';

export class UserTokenResponseDto {
  @Expose()
  id: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => UserType)
  user: UserType;

  @Expose()
  status: string;

  @Expose()
  web: string;

  @Expose()
  android: string;

  @Expose()
  ios: string;
}
