import { UserType } from 'src/decorators/user.decorator';
import { Platform } from '../enums';

export class AnnounceUserSubscribeCommand {
  constructor(
    readonly deviceToken: string,
    readonly platform: Platform,
    readonly user: UserType,
  ) {}
}
