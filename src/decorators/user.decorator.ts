import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserType {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '12345',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'example@email.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '12345',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  phone: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  fullName: string;

  @ApiProperty({
    description: 'gender of the user',
    example: 'male',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  gender: string;

  @ApiProperty({
    description: 'The role of the user',
    example: '12345',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  role: string;

  @ApiProperty({
    description: 'The profile picture URL of the user',
    example: '12345',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  profilePicture: string;
}

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserType;
  },
);
