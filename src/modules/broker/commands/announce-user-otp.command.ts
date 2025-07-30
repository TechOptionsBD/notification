export interface IUserOtpDto {
  phone: string;
  otpNumber: string;
}

export class AnnounceUserOtpCommand {
  constructor(public readonly body: IUserOtpDto) {}
}
