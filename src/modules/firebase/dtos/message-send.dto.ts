import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MessageSentDto {
  @ApiProperty({
    description: 'The unique identifier of the sender',
    example: '12345',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The message body to be sent',
    example: 'This is a test message.',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    description: 'The unique identifier of the receiver',
    example: '67890',
  })
  @IsString()
  @IsNotEmpty()
  receiverId: string;
}
