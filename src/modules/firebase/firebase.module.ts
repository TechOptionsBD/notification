import { Module } from '@nestjs/common';
import { FirebaseController } from './controllers/firebase.controller';
import { FirebaseService } from './services/firebase.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [FirebaseService],
  controllers: [FirebaseController],
  exports: [FirebaseService],
})
export class FirebaseModule {}
