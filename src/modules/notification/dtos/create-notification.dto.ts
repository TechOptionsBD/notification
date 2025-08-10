import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationPayload } from './notification-payload';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'The unique identifier of the sender',
    example: '12345',
  })
  @IsString()
  @IsNotEmpty()
  sender: string;

  @ApiProperty({
    description: 'The unique identifier of the receiver',
    example: '67890',
  })
  @IsString()
  @IsNotEmpty()
  receiver: string;

  @ApiProperty({
    description: 'The unique identifier for the type of notification',
    example: 'type-id-123',
  })
  @IsString()
  @IsNotEmpty()
  typeId: string;

  @ApiProperty({
    description: 'The status of the notification',
    example: 'unread',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'The title of the notification',
    example: 'New Friend Request',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The type of notification',
    example: 'friend-request',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'The status of the notification',
    example: 'unread',
    required: true,
  })
  @Type(() => NotificationPayload)
  @IsNotEmpty()
  payload: NotificationPayload;

  @ApiProperty({
    description: 'The status of the notification',
    example: 'unread',
  })
  @IsBoolean()
  @IsOptional()
  sendPush: boolean = true;

  @ApiProperty({
    description: 'Whether to send an email notification',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  sendEmail: boolean = false;

  @ApiProperty({
    description: 'Whether to send an SMS notification',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  sendSms: boolean = false;
}
