import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnnounceTokenRefreshCommand } from '../commands/announce-token-refresh.command';
import { FirebaseService } from 'src/modules/firebase/services/firebase.service';

@CommandHandler(AnnounceTokenRefreshCommand)
@Injectable()
export class AnnounceTokenRefreshHandler
  implements ICommandHandler<AnnounceTokenRefreshCommand>
{
  constructor(private messageService: FirebaseService) {}

  public async execute(command: AnnounceTokenRefreshCommand): Promise<any> {
    await this.messageService.sendMessageTopicUsingData(command.body.userId);
    return true;
  }
}
