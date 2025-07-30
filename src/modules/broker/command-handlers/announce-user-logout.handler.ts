import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnnounceUserLogoutCommand } from '../commands/announce-user-logout.command';
import { UserTokenService } from 'src/modules/user-token/services/user-token.service';
import { FirebaseService } from 'src/modules/firebase/services/firebase.service';

@CommandHandler(AnnounceUserLogoutCommand)
@Injectable()
export class AnnounceUserLogoutHandler
  implements ICommandHandler<AnnounceUserLogoutCommand>
{
  constructor(
    private userTokenService: UserTokenService,
    private firebaseService: FirebaseService,
  ) {}

  async execute(command: AnnounceUserLogoutCommand): Promise<boolean> {
    const { userId, platform } = command;
    const userToken = await this.userTokenService.userTokenByUserIdFromBroker(
      userId,
      platform,
    );
    if (!userToken) return true;
    // when user platform null/undefined/ thn skip id
    if (!userToken[platform]) return true;
    return await this.firebaseService.unsubscribeToTopic(
      userToken[platform],
      userToken.user,
    );
  }
}
