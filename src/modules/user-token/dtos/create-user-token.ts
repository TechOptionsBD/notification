import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserTokenDto {
  @ApiProperty({
    description: 'The user ID for which the token is being created or updated',
  })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;
}
