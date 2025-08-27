import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Environment } from 'src/common/enums';
import { MailService } from 'src/common/services/mail.service';
import { SmsService } from 'src/common/services/sms.service';
import { UserType } from 'src/decorators/user.decorator';
import {
  IUserCreateDto,
  UserRole,
} from 'src/modules/broker/commands/announce-user-create.command';
import { UserInactivityEventDto } from 'src/modules/broker/commands/announce-user-inactivity.command';
import { AnnounceUserLoginCommand } from 'src/modules/broker/commands/announce-user-login.command';
import { Platform } from 'src/modules/broker/enums';
import { FirebaseService } from 'src/modules/firebase/services/firebase.service';
import { CreateNotificationDto } from 'src/modules/notification/dtos/create-notification.dto';
import {
  PayloadNotiStatus,
  PayloadNotiType,
} from 'src/modules/notification/dtos/notification-payload';
import { NotificationType } from 'src/modules/notification/enums';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { Repository } from 'typeorm';
import { CreateUserTokenDto } from '../dtos/create-user-token';
import { UserToken } from '../entities/user-token.entity';

/**
 * Service for managing user tokens, device tokens, and related notifications.
 * Handles user login, onboarding, inactivity, and notification delivery.
 */
@Injectable()
export class UserTokenService {
  private readonly secretKey: string;
  private readonly nodeEnv: string;

  /**
   * Constructor for UserTokenService.
   * @param userTokenRepos TypeORM repository for UserToken entity
   * @param commandBus CQRS command bus for event publishing
   * @param config ConfigService for environment/config values
   * @param firebaseService Service for Firebase push notifications
   * @param notiService Service for notification creation
   * @param smsService Service for sending SMS
   * @param mailService Service for sending emails
   */
  constructor(
    @InjectRepository(UserToken)
    private readonly userTokenRepos: Repository<UserToken>,
    private readonly commandBus: CommandBus,
    private readonly config: ConfigService,
    private readonly firebaseService: FirebaseService,
    private readonly notiService: NotificationService,
    private readonly smsService: SmsService,
    private readonly mailService: MailService,
  ) {
    const secretKey = this.config.get<string>('SECRET_KEY');
    const nodeEnv = this.config.get<string>('NODE_ENV') || Environment.DEVELOP;

    if (!secretKey || !nodeEnv) {
      throw new Error('Missing required configuration: secretKey or nodeEnv');
    }

    this.secretKey = secretKey;
    this.nodeEnv = nodeEnv;
  }

  /**
   * Create or update a user token for a given user and platform.
   * Publishes a login event to RabbitMQ.
   */
  public async createOrUpdate(
    body: CreateUserTokenDto,
    user: UserType,
    platform: Platform,
  ) {
    let existUser = await this.userTokenRepos
      .createQueryBuilder('token')
      .where("token.user->>'userId'=:userId", { userId: user.userId })
      .getOne();

    if (existUser) {
      existUser[platform] = body.deviceToken;
    } else {
      existUser = this.userTokenRepos.create();
      existUser[platform] = body.deviceToken;
      existUser.user = user;
    }

    await this.userTokenRepos.save(existUser);

    // Publish user login event to RabbitMQ
    this.commandBus.execute(
      new AnnounceUserLoginCommand(body.deviceToken, platform, user),
    );

    return existUser;
  }

  /**
   * Remove a device token for a user on a specific platform.
   * Used when a user logs out or unsubscribes.
   */
  public async userTokenByUserIdFromBroker(userId: string, platform: Platform) {
    const user = await this.userTokenRepos
      .createQueryBuilder('token')
      .where("token.user->>'userId'=:userId", { userId })
      .select([`token.${platform}`, 'token.id', 'token.user'])
      .getOne();

    if (!user) return null;

    await this.userTokenRepos.update({ id: user.id }, { [platform]: '' });
    return user;
  }

  /**
   * Remove all device tokens for a user (web, ios, android).
   * Used when a user is disabled.
   */
  public async userUnsubWhenDisabled(userId: string) {
    const user = await this.userTokenRepos
      .createQueryBuilder('token')
      .where("token.user->>'userId'=:userId", { userId })
      .select([
        'token.web',
        'token.ios',
        'token.android',
        'token.id',
        'token.user',
      ])
      .getOne();

    if (!user) return null;

    await this.userTokenRepos.update(
      { id: user.id },
      { web: '', android: '', ios: '' },
    );
    return user;
  }

  /**
   * Notify cluster heads when a new user is onboarded.
   * Sends notifications and SMS to all cluster heads.
   */
  public async sendUserCreateMessageToClusterHead(
    body: IUserCreateDto,
  ): Promise<boolean> {
    if (this.nodeEnv !== Environment.PRODUCTION) return true;
    if (body.role === UserRole.ADMIN || body.role === UserRole.USER) {
      const clusterHeadList = [
        {
          fullName: 'S.M. Shoaib',
          userId: '01FZ7E88YHRSFXWGPCWAFRYHZ0',
          phone: '+8801844276689',
        },
        {
          fullName: 'Md. Eftakhar Alam',
          userId: '01FWZKXMMK0H49YT4BPVH539KG',
          phone: '+8801844616565',
        },
        {
          fullName: 'Pijush Kumar Barua',
          userId: '01FZ51YJSB7TSPSJ2YCRMHHD73',
          phone: '+8801844276691',
        },
        {
          fullName: 'Sk. Nasim Hassan',
          userId: '01FWZM3HFH4Z05J4C41CRQMDB4',
          phone: '+8801844616571',
        },
      ];

      const notifications: CreateNotificationDto[] = clusterHeadList.map(
        (user) => ({
          sender: 'system',
          receiver: user.userId,
          typeId: user.userId,
          message: `New ${body.role} onboarded: ${body.fullName} (${body.phone})`,
          title: `New ${body.role} Onboarding`,
          payload: {
            status: PayloadNotiStatus.USER_ONBOARDING,
            type: PayloadNotiType.USER,
          },
          type: NotificationType.USER,
          sendPush: true, // Added default value
          sendEmail: false, // Added default value
          sendSms: false, // Added default value
        }),
      );

      await this.notiService.create(notifications);

      // Send SMS without translation
      const smsMessage = `New ${body.role} onboarded: ${body.fullName} (${body.phone})`;
      await Promise.allSettled(
        clusterHeadList.map((user) =>
          this.smsService.send(user.phone, smsMessage),
        ),
      );

      return true;
    }
    return true;
  }

  /**
   * Send email alerts to KAMs who are inactive.
   * @param body List of inactive KAMs
   */
  public async sendInactiveMailToKam(body: UserInactivityEventDto[]) {
    if (!body.length) return true;

    await Promise.allSettled(
      body.map(async (user) => {
        const subject = `Inactive KAM Alert: ${user.fullName}`;
        const emailBody = `KAM ${user.fullName} has been inactive. Please follow up.`;

        Logger.log({ subject, emailBody }, 'UserInactivityMessage');
        Logger.log(user.email, 'InActiveUserEmail');

        await this.mailService.send(user.email, subject, emailBody);
      }),
    );

    return true;
  }

  /**
   * Create and send a notification to a user.
   * Optionally sends push, email, or SMS based on options.
   */
  public async createNotification(
    receiver: string,
    message: string,
    title: string,
    payload: {
      status: PayloadNotiStatus;
      type: PayloadNotiType;
    } & Record<string, unknown>,
    type: NotificationType = NotificationType.USER,
    sender: string = 'system',
    options: {
      sendPush?: boolean;
      sendEmail?: boolean;
      sendSms?: boolean;
    } = {},
  ): Promise<void> {
    const notificationDto: CreateNotificationDto = {
      sender,
      receiver,
      typeId: Date.now().toString(),
      message,
      title,
      payload,
      type,
      sendPush: options.sendPush ?? true, // Default to true
      sendEmail: options.sendEmail ?? false, // Default to false
      sendSms: options.sendSms ?? false, // Default to false
    };

    await this.notiService.create(notificationDto);

    // Send push notification if enabled
    if (notificationDto.sendPush) {
      await this.firebaseService.sendMessageTopic(
        { title, body: message },
        receiver,
      );
    }

    // Could add email and SMS sending here if needed
  }
}
