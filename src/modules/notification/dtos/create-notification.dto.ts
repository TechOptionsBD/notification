import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationPayload } from './notification-payload';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  sender: string;

  @IsString()
  @IsNotEmpty()
  receiver: string;

  @IsString()
  @IsNotEmpty()
  typeId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @Type(() => NotificationPayload)
  @IsNotEmpty()
  payload: NotificationPayload;

  @IsBoolean()
  @IsOptional()
  sendPush: boolean = true;

  @IsBoolean()
  @IsOptional()
  sendEmail: boolean = false;

  @IsBoolean()
  @IsOptional()
  sendSms: boolean = false;
}
