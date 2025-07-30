import { Injectable, Body } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnnounceUserInactivityCommand } from '../commands/announce-user-inactivity.command';
import { UserTokenService } from 'src/modules/user-token/services/user-token.service';

@CommandHandler(AnnounceUserInactivityCommand)
@Injectable()
export class AnnounceUserInactivityHandler
  implements ICommandHandler<AnnounceUserInactivityCommand>
{
  constructor(private userToken: UserTokenService) {}

  public async execute(command: AnnounceUserInactivityCommand) {
    return await this.userToken.sendInactiveMailToKam(command.body);
  }
}
