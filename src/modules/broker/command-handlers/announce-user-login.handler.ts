import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BrokerService } from '../broker.service';
import { AnnounceUserLoginCommand } from '../commands/announce-user-login.command';

@CommandHandler(AnnounceUserLoginCommand)
@Injectable()
export class AnnounceUserLoginHandler
  implements ICommandHandler<AnnounceUserLoginCommand>
{
  constructor(private brokerService: BrokerService) {}
  async execute(command: AnnounceUserLoginCommand): Promise<any> {
    const { deviceToken, platform, user } = command;
    if (this.brokerService.isConnected()) {
      const isPublished = await this.brokerService.userLogin(
        deviceToken,
        platform,
        user,
      );
      return isPublished;
    } else {
      // call api when rabbbitmq not connected
      return;
    }
  }
}
