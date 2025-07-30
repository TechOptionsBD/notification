import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { SmsService } from 'src/common/services/sms.service';
import { UserTokenModule } from '../user-token/user-token.module';
import { BrokerService } from './broker.service';
import { AnnounceUserCreateHandler } from './command-handlers/announce-user-create.handler';
import { AnnounceUserDisableHandler } from './command-handlers/announce-user-disable.handler';
import { AnnounceUserInactivityHandler } from './command-handlers/announce-user-inactivity.handler';
import { AnnounceUserLoginHandler } from './command-handlers/announce-user-login.handler';
import { AnnounceUserLogoutHandler } from './command-handlers/announce-user-logout.handler';
import { AnnounceUserOtpHandler } from './command-handlers/announce-user-otp.handler';
import { AnnounceUserPasswordHandler } from './command-handlers/announce-user-password.handler';
import { AnnounceUserSubscribeHandler } from './command-handlers/announce-user-subscriber.handler';
import { FirebaseModule } from '../firebase/firebase.module';
@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    UserTokenModule,
    HttpModule,
    FirebaseModule,
  ],
  controllers: [],
  providers: [
    BrokerService,
    SmsService,
    AnnounceUserLoginHandler,
    AnnounceUserLogoutHandler,
    AnnounceUserOtpHandler,
    AnnounceUserPasswordHandler,
    AnnounceUserSubscribeHandler,
    AnnounceUserDisableHandler,
    AnnounceUserCreateHandler,
    AnnounceUserInactivityHandler,
  ],
  exports: [BrokerService],
})
export class BrokerModule {}
