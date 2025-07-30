import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnnounceUserSubscribeCommand } from '../commands/announce-user-subscribe.command';
import { FirebaseService } from 'src/modules/firebase/services/firebase.service';

@CommandHandler(AnnounceUserSubscribeCommand)
@Injectable()
export class AnnounceUserSubscribeHandler
  implements ICommandHandler<AnnounceUserSubscribeCommand>
{
  constructor(private firebaseService: FirebaseService) {}

  async execute(command: AnnounceUserSubscribeCommand): Promise<boolean> {
    const { deviceToken, platform, user } = command;
    await this.firebaseService.subscribeToTopic(deviceToken, user);
    return true;
  }
}
