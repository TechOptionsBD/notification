import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { messaging } from 'firebase-admin';
import { UserType } from 'src/decorators/user.decorator';

@Injectable()
export class FirebaseService {
  private messaging: messaging.Messaging;
  private readonly globalTopic: string;
  private readonly messagePlatformOptions: {
    android?: admin.messaging.AndroidConfig;
    apns?: admin.messaging.ApnsConfig;
    webpush?: admin.messaging.WebpushConfig;
    data?: { [key: string]: string };
  };

  constructor(private readonly config: ConfigService) {
    const nodeEnv = this.config.get<string>('NODE_ENV');
    if (!nodeEnv) throw new Error('NODE_ENV is not configured');

    const globalTopic = this.config.get<string>('GLOBAL_TOPIC');
    if (!globalTopic) throw new Error('Global topic is not configured');

    this.globalTopic = globalTopic;

    // Initialize Firebase
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.get('FIREBASE_PROJECT_ID'),
          clientEmail: this.config.get('FIREBASE_CLIENT_EMAIL'),
          privateKey: this.config
            .get('FIREBASE_PRIVATE_KEY')
            ?.replace(/\\n/g, '\n'),
        }),
      });
    }
    this.messaging = admin.messaging();
    this.messagePlatformOptions = this.createMessagePlatformOptions();
  }

  private createMessagePlatformOptions() {
    return {
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high' as const,
      },
      apns: {
        payload: {
          aps: {
            'apns-priority': 10,
          },
        },
      },
      webpush: {
        headers: {
          Urgency: 'high',
        },
      },
    };
  }

  public async sendMessageTopic(
    notification: admin.messaging.Notification,
    topic: string,
    retryCount = 0,
  ): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        ...this.messagePlatformOptions,
        notification,
        topic, // Required field that makes this a valid Message
      };

      const response = await this.messaging.send(message);
      Logger.log(`Message sent to ${topic}: ${response}`);
      return response;
    } catch (error) {
      if (retryCount < 5) {
        Logger.warn(`Retry ${retryCount + 1} for topic ${topic}`);
        return this.sendMessageTopic(notification, topic, retryCount + 1);
      }
      Logger.error(`Failed to send to ${topic}: ${error.message}`);
      throw error;
    }
  }

  public async subscribeToTopic(
    registrationToken: string,
    user: UserType,
    retryNumberOfTimes: number = 0,
  ): Promise<boolean> {
    try {
      await this.messaging.subscribeToTopic(
        registrationToken,
        this.globalTopic,
      );
      Logger.log(user.userId, 'UserGlobalTopicsSubsSuccessfully');

      await this.messaging.subscribeToTopic(registrationToken, user.userId);
      Logger.log(user.userId, 'UserIndividualTopicsSubsSuccessfully');
      return true;
    } catch (error) {
      if (retryNumberOfTimes < 5) {
        Logger.log(retryNumberOfTimes, 'SubscribeToTopicRetry');
        return this.subscribeToTopic(
          registrationToken,
          user,
          retryNumberOfTimes + 1,
        );
      }
      Logger.error(error, 'SubscribeToTopicError');
      return false;
    }
  }

  public async unsubscribeToTopic(
    registrationToken: string,
    user: UserType,
    retryNumberOfTimes: number = 0,
  ): Promise<boolean> {
    try {
      await this.messaging.unsubscribeFromTopic(
        registrationToken,
        this.globalTopic,
      );
      Logger.log(user.userId, 'UserGlobalTopicsUnSubscription');

      await this.messaging.unsubscribeFromTopic(registrationToken, user.userId);
      Logger.log(user.userId, 'UserGlobalIndividualTopicsUnSubscription');
      return true;
    } catch (error) {
      if (retryNumberOfTimes < 5) {
        Logger.log(retryNumberOfTimes, 'UnsubscribeToTopicRetry');
        return this.unsubscribeToTopic(
          registrationToken,
          user,
          retryNumberOfTimes + 1,
        );
      }
      Logger.error(error, 'UnsubscribeToTopicError');
      return false;
    }
  }

  public async sendMessageTopicUsingData(userId: string): Promise<string> {
    const message: admin.messaging.Message = {
      data: {},
      topic: userId,
    };
    return this.messaging.send(message);
  }
}
