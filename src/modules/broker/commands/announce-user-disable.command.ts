export interface IUserDisableEventDto {
  userId: string;
  isEnabled: boolean;
}

export class AnnounceUserDisableCommand {
  constructor(public body: IUserDisableEventDto) {}
}
