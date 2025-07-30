import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// user-notification-preference.entity.ts
@Entity('user_notification_preferences')
export class UserNotificationPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column({ type: 'jsonb' })
  preferences: {
    push: boolean;
    email: boolean;
    sms: boolean;
    // Notification type preferences
    friendRequests: boolean;
    postLikes: boolean;
    gameInvites: boolean;
  };
}
