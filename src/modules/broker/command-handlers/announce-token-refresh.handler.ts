import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FirebaseService } from 'src/modules/firebase/services/firebase.service';
import { AnnounceTokenRefreshCommand } from '../commands/announce-token-refresh.command';

@CommandHandler(AnnounceTokenRefreshCommand)
@Injectable()
export class AnnounceTokenRefreshHandler
  implements ICommandHandler<AnnounceTokenRefreshCommand>
{
  constructor(private messageService: FirebaseService) {}

  public async execute(command: AnnounceTokenRefreshCommand): Promise<boolean> {
    await this.messageService.sendMessageTopicUsingData(command.body.userId);
    return true;
  }
}
