import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper, AmqpConnectionManager } from 'amqp-connection-manager';
import { ConsumeMessage, Options } from 'amqplib';
import { AnnounceUserSubscribeCommand } from './commands/announce-user-subscribe.command';
import { AnnounceUserLogoutCommand } from './commands/announce-user-logout.command';
import {
  AnnounceUserDisableCommand,
  IUserDisableEventDto,
} from './commands/announce-user-disable.command';
import {
  AnnounceTokenRefreshCommand,
  ITokenRefreshDto,
} from './commands/announce-token-refresh.command';
import {
  AnnounceUserPasswordCommand,
  IUserPasswordDto,
} from './commands/announce-user-password.command';
import {
  AnnounceUserOtpCommand,
  IUserOtpDto,
} from './commands/announce-user-otp.command';
import {
  AnnounceUserCreateCommand,
  IUserCreateDto,
} from './commands/announce-user-create.command';
import {
  AnnounceUserInactivityCommand,
  UserInactivityEventDto,
} from './commands/announce-user-inactivity.command';
import { UserType } from 'src/decorators/user.decorator';
import { Platform } from './enums';
import { Consumer } from './consumer';

@Injectable()
export class BrokerService {
  private connection: AmqpConnectionManager;
  private retryDelay: number = 20;
  private channel: ChannelWrapper;

  constructor(
    private readonly config: ConfigService,
    private readonly commandBus: CommandBus,
  ) {
    const rabbitmqUrl = this.config.get<string>('rabbitmqUrl');
    if (!rabbitmqUrl) {
      throw new Error('RabbitMQ URL is not configured');
    }

    this.connection = amqp.connect([rabbitmqUrl], {
      reconnectTimeInSeconds: this.retryDelay,
      connectionOptions: {
        keepAlive: true,
      },
    });

    this.connection.on('connect', this.onConnection);
    this.connection.on('disconnect', this.onDisconnection.bind(this));

    this.channel = this.connection.createChannel({
      json: true,
      setup: (channel) =>
        channel.assertQueue(Consumer.NOTIFICATION_QUEUE, { durable: true }),
    });

    this.consumeMessage();
  }

  private consumeMessage() {
    this.channel.addSetup((channel) => {
      channel.consume(
        Consumer.NOTIFICATION_QUEUE,
        async (msg: ConsumeMessage | null) => {
          if (!msg) return;

          try {
            const { fields, content, properties } = msg;
            Logger.log(
              JSON.stringify(fields.routingKey, null, 3),
              'RoutingKey',
            );
            Logger.log(content.toString(), 'EventContent');

            const contentObj = JSON.parse(content.toString());
            let command;

            switch (fields.routingKey) {
              case Consumer.NOTIFICATION_USER_LOGIN_ROUTING_KEY:
                command = new AnnounceUserSubscribeCommand(
                  contentObj.deviceToken,
                  contentObj.platform,
                  contentObj.user,
                );
                break;

              case Consumer.USER_LOGOUT_ROUTING_KEY:
                command = new AnnounceUserLogoutCommand(
                  contentObj.body.userId,
                  contentObj.body.platform,
                );
                break;

              case Consumer.USER_DISABLE_ROUTING_KEY:
                command = new AnnounceUserDisableCommand(
                  contentObj.body as IUserDisableEventDto,
                );
                break;

              case Consumer.USER_TOKEN_REFRESH_ROUTING_KEY:
                command = new AnnounceTokenRefreshCommand(
                  contentObj as ITokenRefreshDto,
                );
                break;

              case Consumer.USER_PASSWORD_ROUTING_KEY:
                command = new AnnounceUserPasswordCommand(
                  contentObj.body as IUserPasswordDto,
                );
                break;

              case Consumer.USER_OTP_SEND_ROUTING_KEY:
                command = new AnnounceUserOtpCommand(
                  contentObj.body as IUserOtpDto,
                );
                break;

              case Consumer.SHIPPER_CREATE_ROUTING_KEY:
              case Consumer.SUPPLIER_CREATE_ROUTING_KEY:
                command = new AnnounceUserCreateCommand(
                  contentObj.body as IUserCreateDto,
                );
                break;

              case Consumer.USER_INACTIVITY_ROUTING_KEY:
                command = new AnnounceUserInactivityCommand(
                  contentObj.body as UserInactivityEventDto[],
                );
                break;

              default:
                Logger.log(
                  JSON.stringify(fields.routingKey, null, 3),
                  'NoRoutingKeyMatching',
                );
                channel.ack(msg);
                return;
            }

            await this.commandBus.execute(command);
            channel.ack(msg);
          } catch (err) {
            Logger.error(err, 'MessageProcessingError');
            channel.nack(msg, false, false);
          }
        },
      );
    });
  }

  public async userLogin(
    deviceToken: string,
    platform: Platform,
    user: UserType,
  ): Promise<boolean> {
    try {
      return await this.channel.publish(
        Consumer.NOTIFICATION_EXCHANGE,
        Consumer.NOTIFICATION_USER_LOGIN_ROUTING_KEY,
        { deviceToken, platform, user },
        {
          persistent: true,
          contentType: 'application/json',
        } as Options.Publish,
      );
    } catch (err) {
      Logger.error(err, 'UserLoginPublishError');
      throw err;
    }
  }

  public isConnected(): boolean {
    return this.connection.isConnected();
  }

  private onConnection(connection: unknown, connection_url: string): void {
    Logger.log(`RabbitMQ connection established!`, 'RMQBrokerService');
  }

  private onDisconnection(err: Error): void {
    Logger.error(`RabbitMQ disconnected! ${err?.message}`, 'RMQBrokerService');
    Logger.log(
      `Retrying connection in ${this.retryDelay} second(s)`,
      'RMQBrokerService',
    );
  }
}
