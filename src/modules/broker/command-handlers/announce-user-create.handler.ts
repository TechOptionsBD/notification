import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnnounceUserCreateCommand } from '../commands/announce-user-create.command';
import { UserTokenService } from 'src/modules/user-token/services/user-token.service';

@CommandHandler(AnnounceUserCreateCommand)
@Injectable()
export class AnnounceUserCreateHandler
  implements ICommandHandler<AnnounceUserCreateCommand>
{
  constructor(private userToken: UserTokenService) {}

  public async execute(command: AnnounceUserCreateCommand) {
    return await this.userToken.sendUserCreateMessageToClusterHead(
      command.body,
    );
  }
}
