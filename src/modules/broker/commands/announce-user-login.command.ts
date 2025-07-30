import { UserType } from 'src/decorators/user.decorator';
import { Platform } from '../enums';

export class AnnounceUserLoginCommand {
  constructor(
    readonly deviceToken: string,
    readonly platform: Platform,
    readonly user: UserType,
  ) {}
}
