import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionFilter } from './common/filters';
import {
  ErrorLoggerInterceptor,
  RequestLoggerInterceptor,
} from './common/interceptors';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrokerModule } from './modules/broker/broker.module';
import { UserTokenModule } from './modules/user-token/user-token.module';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { NotificationModule } from './modules/notification/notification.module';
import DataSource from './data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({}), // Empty factory since we're using dataSourceFactory
      dataSourceFactory: async () => {
        await DataSource.initialize();
        return DataSource;
      },
    }),
    BrokerModule,
    UserTokenModule,
    FirebaseModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorLoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor,
    },
    AppService,
  ],
})
export class AppModule {}
