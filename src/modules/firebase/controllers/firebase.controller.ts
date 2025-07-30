import { Body, Controller, Post } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { FirebaseService } from '../services/firebase.service';
import { MessageSentDto } from '../dtos/message-send.dto';

@Controller('firebase')
export class FirebaseController {
  constructor(private service: FirebaseService) {}

  @Post('/')
  public async subscribeToTopic(@User() user) {
    await this.service.subscribeToTopic('2342343', user);
    return {
      message: 'Message send topics successfully.',
      data: {},
    };
  }

  @Post('/message')
  public async sendMessage(@Body() body: MessageSentDto, @User() user) {
    await this.service.sendMessageTopic(
      { title: body.title, body: body.body },
      body.receiverId,
    );
    return {
      message: 'Message send topics successfully.',
      data: {},
    };
  }
}
