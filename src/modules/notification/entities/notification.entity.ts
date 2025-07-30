import { AbstractEntity } from 'src/common/abstract-entity';
import { Status } from 'src/modules/user-token/enums';
import { Column, Entity, Index } from 'typeorm';
import { NotificationPayload } from '../dtos/notification-payload';
import { NotificationStatus, NotificationType } from '../enums';

@Entity('notifications')
@Index('idx_notification_receiver', ['receiver']) // Simplified index definition
@Index('idx_notifications_receiver_notificationstatus_status_id', [
  'receiver',
  'notificationStatus',
  'status',
  'id',
])
@Index('idx_notifications_receiver_notificationstatus_status_read_id', [
  'receiver',
  'notificationStatus',
  'status',
  'isRead',
  'id',
])
export class Notification extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 36,
    nullable: false,
  })
  sender: string;

  @Column({
    type: 'varchar',
    length: 36,
    nullable: false,
  })
  receiver: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    comment: 'Whether the notification has been read by the recipient',
  })
  isRead: boolean;

  @Column({
    type: 'varchar',
    length: 36, // UUID length
    nullable: false,
    comment: 'ID of the related entity (post, game, friend request, etc.)',
  })
  typeId: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: 'Short title/heading of the notification',
  })
  title: string;

  @Column({
    type: 'text',
    nullable: false,
    comment: 'Detailed message content of the notification',
  })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    nullable: false,
    comment: 'Category/type of the notification',
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    nullable: false,
    default: NotificationStatus.ACTIVE,
    comment: 'Status of the notification (active, archived, etc.)',
  })
  notificationStatus: NotificationStatus;

  @Column({
    type: 'jsonb',
    nullable: false,
    default: {},
    comment: 'Additional metadata and context for the notification',
  })
  payload: NotificationPayload;

  @Column({
    type: 'enum',
    enum: Status,
    nullable: false,
    default: Status.ACTIVE,
    comment: 'System status (active, inactive, deleted)',
  })
  status: Status;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    name: 'send_push',
    comment: 'Whether to send this as a push notification',
  })
  sendPush: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'send_email',
    comment: 'Whether to send this as an email notification',
  })
  sendEmail: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'send_sms',
    comment: 'Whether to send this as an SMS notification',
  })
  sendSms: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'read_at',
    comment: 'Timestamp when notification was marked as read',
  })
  readAt: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'delivered_at',
    comment: 'Timestamp when notification was successfully delivered',
  })
  deliveredAt: Date | null;
}
