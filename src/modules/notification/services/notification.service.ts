import { BadRequestException, Inject, Injectable } from '@nestjs/common';
// Use string token for CACHE_MANAGER
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { UserType } from 'src/decorators/user.decorator';
import { FirebaseService } from 'src/modules/firebase/services/firebase.service';
import { Status } from 'src/modules/user-token/enums';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from '../dtos/create-notification.dto';
import { FilterNotificationDto } from '../dtos/filter-notification.dto';
import {
  PayloadNotiStatus,
  PayloadNotiType,
} from '../dtos/notification-payload';
import { UpdateNotificationDto } from '../dtos/update-notification.dto';
import { Notification } from '../entities/notification.entity';
import { NotificationStatus, NotificationType } from '../enums';

/**
 * Service for managing notifications: creation, retrieval, update, and delivery.
 * Handles caching, batch operations, and integration with Firebase for push notifications.
 */
@Injectable()
export class NotificationService {
  /**
   * Constructor for NotificationService.
   * @param notiRepos TypeORM repository for Notification entity
   * @param firebaseService Service for Firebase push notifications
   * @param cacheManager Cache manager for notification caching
   */
  constructor(
    @InjectRepository(Notification) private notiRepos: Repository<Notification>,
    private readonly firebaseService: FirebaseService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  /**
   * Get notifications for a user with pagination and caching.
   * Returns notifications, total count, and unread count.
   */
  async getNotifications(
    filter: FilterNotificationDto,
    user: UserType,
  ): Promise<[Notification[], number, number]> {
    const cacheKey = `notifications:${user.userId}:${JSON.stringify(filter)}`;
    const cached =
      await this.cacheManager.get<[Notification[], number, number]>(cacheKey);
    if (cached) return cached;
    const { page, limit, isRead, ...rest } = filter;
    const unreadPromise = this.notiRepos
      .createQueryBuilder('notification')
      .where(
        'notification.receiver=:receiver AND notification.notificationStatus=:notificationStatus AND notification.status=:status AND notification.isRead=false',
      )
      .setParameters({
        receiver: user.userId,
        notificationStatus: NotificationStatus.ACTIVE,
        status: Status.ACTIVE,
      })
      .getCount();
    const notificationPromise = this.notiRepos
      .createQueryBuilder('notification')
      .where(
        'notification.receiver=:receiver AND notification.notificationStatus=:notificationStatus AND notification.status=:status',
      )
      .andWhere(isRead ? 'notification.isRead=:isRead' : {})
      .setParameters({
        receiver: user.userId,
        notificationStatus: NotificationStatus.ACTIVE,
        status: Status.ACTIVE,
        isRead: isRead,
      })
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('notification.id', 'DESC')
      .getManyAndCount();

    const promises = await Promise.allSettled([
      unreadPromise,
      notificationPromise,
    ]);
    const unreadCount = promises[0]['value'] as number;
    const [notifications, count] = promises[1]['value'] as [
      Notification[],
      number,
    ];
    const result: [Notification[], number, number] = [
      notifications,
      count,
      unreadCount,
    ];
    await this.cacheManager.set(cacheKey, result, 60); // cache for 60 seconds
    return result;
  }

  /**
   * Get notifications for admin users with pagination.
   */
  async getNotificationByAdmin(filter: FilterNotificationDto, user: UserType) {
    const { page, limit, isRead, ...rest } = filter;
    const notifications = await this.notiRepos
      .createQueryBuilder('notification')
      .where(
        'notification.notificationStatus=:notificationStatus AND notification.status=:status',
      )
      .andWhere(isRead ? 'notification.isRead=:isRead' : {})
      .setParameters({
        receiver: user.userId,
        notificationStatus: NotificationStatus.ACTIVE,
        status: Status.ACTIVE,
        isRead: isRead,
      })
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('notification.id', 'DESC')
      .getManyAndCount();
    return notifications;
  }

  /**
   * Create one or more notifications in batch.
   */
  async create(body: CreateNotificationDto | CreateNotificationDto[]) {
    const notifications: Notification[] = [];
    if (Array.isArray(body)) {
      for (const item of body) {
        const notification = await this.notiRepos.create();
        Object.keys(item).forEach((key) => {
          notification[key] = item[key];
        });
        notifications.push(notification);
      }
    } else {
      const notification = await this.notiRepos.create();
      Object.keys(body).forEach((key) => {
        notification[key] = body[key];
      });
      notifications.push(notification);
    }
    return await this.notiRepos.save(notifications);
  }

  /**
   * Mark a notification (or all) as read for a user.
   */
  async updateNotification(body: UpdateNotificationDto, user: UserType) {
    if (body.id === 'all')
      return await this.notiRepos.update(
        {
          receiver: user.userId,
          isRead: false,
        },
        { isRead: true },
      );
    const exits = await this.notiRepos.findOne({
      where: {
        id: parseInt(body.id),
        receiver: user.userId,
      },
    });
    if (!exits)
      throw new BadRequestException(
        'Invalid notification id or notification is not owned by you.',
      );
    exits.isRead = true;
    await this.notiRepos.save(exits);
    return {};
  }

  /**
   * Create a social notification for a user (friend request, like, comment, game invite).
   */
  async createSocialNotification(
    receiverId: string,
    type: 'friend-request' | 'post-like' | 'comment' | 'game-invite',
    context: {
      senderId: string;
      senderName: string;
      senderAvatar?: string;
      gameId?: string;
      postId?: string;
    },
  ) {
    // Map notification types to payload types
    const payloadTypeMap = {
      'friend-request': PayloadNotiType.FRIEND_REQUEST,
      'post-like': PayloadNotiType.POST_LIKE,
      comment: PayloadNotiType.COMMENT,
      'game-invite': PayloadNotiType.GAME_INVITE,
    };

    const notification = this.notiRepos.create({
      receiver: receiverId,
      sender: context.senderId,
      typeId: context.gameId || context.postId || Date.now().toString(),
      message: `${context.senderName} ${this.getMessageForType(type)}`,
      title: 'Social Update',
      type: NotificationType.SOCIAL,
      payload: {
        type: payloadTypeMap[type],
        status: PayloadNotiStatus.UNREAD,
        ...context,
      },
      sendPush: true,
      sendEmail: false,
      sendSms: false,
      isRead: false,
      notificationStatus: NotificationStatus.ACTIVE,
      status: Status.ACTIVE,
    });

    return this.notiRepos.save(notification);
  }

  /**
   * Helper to get a message string for a given notification type.
   */
  private getMessageForType(type: string): string {
    const messages = {
      'friend-request': 'sent you a friend request',
      'post-like': 'liked your post',
      comment: 'commented on your post',
      'game-invite': 'invited you to a game',
    };
    return messages[type] || 'sent you a notification';
  }

  /**
   * Mark multiple notifications as read for a user.
   */
  async markMultipleAsRead(userId: string, notificationIds: string[]) {
    return this.notiRepos
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('id IN (:...ids)', { ids: notificationIds })
      .andWhere('receiver = :userId', { userId })
      .execute();
  }

  // TODO: Integrate Bull or another queue for notification delivery
  // Example:
  // const notificationQueue = new Queue('notifications', { redis: { host: 'redis' } });
  // notificationQueue.process(async (job) => {
  //   // process notification delivery
  // });

  /**
   * Get notifications for a user (alternate method, used in some controllers).
   */
  async getNotificationsForUser(
    userId: string,
    filter: FilterNotificationDto,
  ): Promise<[Notification[], number, number]> {
    const { page, limit, isRead, ...rest } = filter;

    const unreadPromise = this.notiRepos
      .createQueryBuilder('notification')
      .where(
        'notification.receiver = :receiver AND notification.notificationStatus = :notificationStatus AND notification.status = :status AND notification.isRead = false',
      )
      .setParameters({
        receiver: userId,
        notificationStatus: NotificationStatus.ACTIVE,
        status: Status.ACTIVE,
      })
      .getCount();

    const notificationPromise = this.notiRepos
      .createQueryBuilder('notification')
      .where(
        'notification.receiver = :receiver AND notification.notificationStatus = :notificationStatus AND notification.status = :status',
      )
      .andWhere(
        isRead !== undefined ? 'notification.isRead = :isRead' : '1=1',
        { isRead },
      )
      .setParameters({
        receiver: userId,
        notificationStatus: NotificationStatus.ACTIVE,
        status: Status.ACTIVE,
        ...(isRead !== undefined ? { isRead } : {}),
      })
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('notification.id', 'DESC')
      .getManyAndCount();

    const [unreadCount, [notifications, count]] = await Promise.all([
      unreadPromise,
      notificationPromise,
    ]);

    return [notifications, count, unreadCount];
  }

  /**
   * Mark a notification (or all) as read for a user (alternate method).
   */
  async updateNotificationForUser(
    userId: string,
    body: UpdateNotificationDto,
  ): Promise<{ success: boolean }> {
    if (body.id === 'all') {
      await this.notiRepos.update(
        {
          receiver: userId,
          isRead: false,
        },
        { isRead: true },
      );
      return { success: true };
    }

    const exists = await this.notiRepos.findOne({
      where: {
        id: parseInt(body.id),
        receiver: userId,
      },
    });

    if (!exists) {
      throw new BadRequestException(
        'Invalid notification id or notification is not owned by the user.',
      );
    }

    exists.isRead = true;
    await this.notiRepos.save(exists);
    return { success: true };
  }
}
