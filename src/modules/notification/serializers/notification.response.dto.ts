import { Expose, Type } from 'class-transformer';
import { NotificationPayload } from '../dtos/notification-payload';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the notification',
    example: '12345',
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'The unique identifier of the sender',
    example: '67890',
  })
  @Expose()
  sender: string;

  @ApiProperty({
    description: 'The unique identifier of the receiver',
    example: '54321',
  })
  @Expose()
  receiver: string;

  @ApiProperty({
    description: 'Indicates whether the notification has been read',
    example: true,
    required: false,
  })
  @Expose()
  isRead: boolean;

  @ApiProperty({
    description: 'The message content of the notification',
    example: 'You have a new friend request.',
  })
  @Expose()
  message: string;

  @ApiProperty({
    description: 'The title of the notification',
    example: 'New Friend Request',
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'The type of notification',
    example: 'friend-request',
    required: true,
  })
  @Expose()
  type: string;

  @ApiProperty({
    description: 'The unique identifier for the type of notification',
    example: 'type-id-123',
  })
  @Expose()
  typeId: string;

  @ApiProperty({
    description: 'The status of the notification',
    example: 'unread',
  })
  @Expose()
  notificationStatus: string;

  @ApiProperty({
    description: 'The status of the notification payload',
    example: 'unread',
  })
  @Expose()
  status: string;

  @ApiProperty({
    description: 'Indicates whether to send a push notification',
    example: true,
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Indicates whether to send an email notification',
    example: true,
  })
  @Expose()
  @Type(() => NotificationPayload)
  payload: NotificationPayload;
}
