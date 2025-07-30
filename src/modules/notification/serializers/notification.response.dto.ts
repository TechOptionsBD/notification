import { Expose, Type } from 'class-transformer';
import { NotificationPayload } from '../dtos/notification-payload';

export class NotificationResponseDto {
  @Expose()
  id: number;

  @Expose()
  sender: string;

  @Expose()
  receiver: string;

  @Expose()
  isRead: boolean;

  @Expose()
  message: string;

  @Expose()
  title: string;

  @Expose()
  type: string;

  @Expose()
  typeId: string;

  @Expose()
  notificationStatus: string;

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => NotificationPayload)
  payload: NotificationPayload;
}
