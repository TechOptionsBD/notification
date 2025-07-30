import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserTokenDto {
  @IsString()
  @IsNotEmpty()
  deviceToken: string;
}
