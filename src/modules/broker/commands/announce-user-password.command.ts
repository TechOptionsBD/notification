export interface IUserPasswordDto {
  phone: string;
  password: string;
}

export class AnnounceUserPasswordCommand {
  constructor(public readonly body: IUserPasswordDto) {}
}
