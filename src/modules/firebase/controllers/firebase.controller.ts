import { Body, Controller, Post } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { FirebaseService } from '../services/firebase.service';
import { MessageSentDto } from '../dtos/message-send.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('firebase')
@Controller('firebase')
export class FirebaseController {
  constructor(private service: FirebaseService) {}

  @ApiOperation({ summary: 'Subscribe to a topic' })
  @ApiResponse({ status: 201, type: MessageSentDto })
  @Post('/')
  public async subscribeToTopic(@User() user) {
    await this.service.subscribeToTopic('2342343', user);
    return {
      message: 'Message send topics successfully.',
      data: {},
    };
  }

  @ApiOperation({ summary: 'Send message to a topic' })
  @ApiResponse({ status: 201, type: MessageSentDto })
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
