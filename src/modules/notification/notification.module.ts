import { forwardRef, Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { TokenService } from 'src/common/services/token.service';
import { HttpModule } from '@nestjs/axios';
import { AdminNotificationController } from './controllers/admin-notification.controller';
import { NotificationController } from './controllers/notification.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { SecretNotificationController } from './controllers/secret-notification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    HttpModule,
    forwardRef(() => FirebaseModule),
  ],
  controllers: [
    NotificationController,
    AdminNotificationController,
    SecretNotificationController,
  ],
  providers: [NotificationService, TokenService],
  exports: [NotificationService],
})
export class NotificationModule {}
