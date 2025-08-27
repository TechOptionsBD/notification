import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FirebaseService } from 'src/modules/firebase/services/firebase.service';
import { UserTokenService } from 'src/modules/user-token/services/user-token.service';
import { AnnounceUserDisableCommand } from '../commands/announce-user-disable.command';

@CommandHandler(AnnounceUserDisableCommand)
@Injectable()
export class AnnounceUserDisableHandler
  implements ICommandHandler<AnnounceUserDisableCommand>
{
  constructor(
    private userTokenService: UserTokenService,
    private firebaseService: FirebaseService,
  ) {}

  async execute(command: AnnounceUserDisableCommand): Promise<boolean> {
    const { userId, isEnabled } = command.body;
    // isEnabled can be true/false
    // isEnabled when comes true when don't need to execute below
    if (isEnabled) return true;
    const userToken = await this.userTokenService.userUnsubWhenDisabled(userId);
    if (!userToken) return true;
    // when user platform null/undefined/ thn skip id
    if (userToken.web)
      this.firebaseService.unsubscribeToTopic(userToken.web, userToken.user);
    if (userToken.ios)
      this.firebaseService.unsubscribeToTopic(userToken.ios, userToken.user);
    if (userToken.android)
      this.firebaseService.unsubscribeToTopic(
        userToken.android,
        userToken.user,
      );
    Logger.log(userToken, 'UnSubFromAllTypePlatform', userToken);
    return true;
  }
}
