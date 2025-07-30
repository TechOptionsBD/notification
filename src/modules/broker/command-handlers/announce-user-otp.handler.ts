import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SmsService } from 'src/common/services/sms.service';
import { AnnounceUserOtpCommand } from '../commands/announce-user-otp.command';

@CommandHandler(AnnounceUserOtpCommand)
@Injectable()
export class AnnounceUserOtpHandler
  implements ICommandHandler<AnnounceUserOtpCommand>
{
  constructor(private readonly smsService: SmsService) {}

  async execute(command: AnnounceUserOtpCommand): Promise<boolean> {
    const text = `Your OTP code is: ${command.body.otpNumber}`;
    await this.smsService.send(command.body.phone, text);
    return true;
  }
}
