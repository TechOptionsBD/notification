export interface ITokenRefreshDto {
  userId: string;
}

export class AnnounceTokenRefreshCommand {
  constructor(readonly body: ITokenRefreshDto) {}
}
