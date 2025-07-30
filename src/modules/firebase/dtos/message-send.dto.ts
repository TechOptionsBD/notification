import { IsNotEmpty, IsString } from 'class-validator';

export class MessageSentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsNotEmpty()
  receiverId: string;
}
