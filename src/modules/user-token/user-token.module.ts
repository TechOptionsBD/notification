import { Module } from '@nestjs/common';
import { UserTokenController } from './controllers/user-token.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserToken } from './entities/user-token.entity';
import { HttpModule } from '@nestjs/axios';
import { TokenService } from 'src/common/services/token.service';
import { CqrsModule } from '@nestjs/cqrs';
import { FirebaseModule } from '../firebase/firebase.module';
import { SmsService } from 'src/common/services/sms.service';
import { NotificationModule } from '../notification/notification.module';
import { MailService } from '../../common/services/mail.service';
import { UserTokenService } from './services/user-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserToken]),
    HttpModule,
    CqrsModule,
    FirebaseModule,
    NotificationModule,
  ],
  controllers: [UserTokenController],
  providers: [UserTokenService, TokenService, SmsService, MailService],
  exports: [UserTokenService],
})
export class UserTokenModule {}
