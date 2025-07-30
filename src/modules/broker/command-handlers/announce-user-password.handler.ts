import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SmsService } from 'src/common/services/sms.service';
import { AnnounceUserPasswordCommand } from '../commands/announce-user-password.command';

@CommandHandler(AnnounceUserPasswordCommand)
@Injectable()
export class AnnounceUserPasswordHandler
  implements ICommandHandler<AnnounceUserPasswordCommand>
{
  constructor(private smsService: SmsService) {}

  async execute(command: AnnounceUserPasswordCommand): Promise<any> {
    const text = `Your passCode code is: ${command.body.password}`;
    await this.smsService.send(command.body.phone, text);
    return true;
  }
}
