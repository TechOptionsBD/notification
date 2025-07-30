import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
  @IsEnum(PayloadNotiType)
  @IsNotEmpty()
  type: PayloadNotiType;

  @IsEnum(PayloadNotiStatus)
  @IsNotEmpty()
  status: PayloadNotiStatus;
}
