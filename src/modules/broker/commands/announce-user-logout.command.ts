import { Platform } from '../enums';

export class AnnounceUserLogoutCommand {
  constructor(
    readonly userId: string,
    readonly platform: Platform,
  ) {}
}
