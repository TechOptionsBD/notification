import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum PayloadNotiType {
  FRIEND_REQUEST = 'friend-request',
  POST_LIKE = 'post-like',
  COMMENT = 'comment',
  GAME_INVITE = 'game-invite',
  USER_ONBOARDING = 'user-onboarding',
  USER = 'user',
}

export enum PayloadNotiStatus {
  USER_ONBOARDING = 'user_onboarding',
  UNREAD = 'unread',
  READ = 'read',
  DELETED = 'deleted',
}

export class NotificationPayload {
  @ApiProperty({
    description: 'The type of notification payload',
    enum: PayloadNotiType,
    example: PayloadNotiType.FRIEND_REQUEST,
  })
  @IsEnum(PayloadNotiType)
  @IsNotEmpty()
  type: PayloadNotiType;

  @ApiProperty({
    description: 'The unique identifier for the notification payload',
    example: '12345',
  })
  @IsEnum(PayloadNotiStatus)
  @IsNotEmpty()
  status: PayloadNotiStatus;
}
