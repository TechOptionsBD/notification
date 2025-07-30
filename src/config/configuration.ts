// config/configuration.ts
import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string, defaultValue = ''): string {
  return process.env[key] || defaultValue;
}

export default () => ({
  port: parseInt(getOptionalEnv('PORT', '3015')),
  nodeEnv: getOptionalEnv('NODE_ENV', 'development'),
  rabbitmqUrl: getRequiredEnv('RABBITMQ_URL'),

  database: {
    type: 'postgres',
    host: getRequiredEnv('DB_HOST'),
    port: parseInt(getRequiredEnv('DB_PORT')),
    username: getRequiredEnv('DB_USERNAME'),
    password: getRequiredEnv('DB_PASSWORD'),
    database: getRequiredEnv('DB_NAME'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.js,.ts}'],
    synchronize: getOptionalEnv('NODE_ENV', 'development') !== 'production',
    logging:
      getOptionalEnv('NODE_ENV', 'development') === 'development'
        ? ['error'] // or false
        : false,
    autoLoadEntities: true,
    ssl:
      getOptionalEnv('NODE_ENV', 'development') === 'production'
        ? {
            rejectUnauthorized: false,
          }
        : false,
  },

  redis: {
    host: getRequiredEnv('REDIS_HOST'),
    port: parseInt(getOptionalEnv('REDIS_PORT', '6379')),
  },
  services: {
    user: getRequiredEnv('USER_SERVICE'),
  },
  secrets: {
    key: getRequiredEnv('SECRET_KEY'),
    sendGridApiKey: getOptionalEnv('SENDGRID_API_KEY'),
  },
  sms: {
    baseUrl: getOptionalEnv('SMS_BASE_URL'),
    username: getOptionalEnv('SMS_USERNAME'),
    password: getOptionalEnv('SMS_PASSWORD'),
  },
  topics: {
    global: getOptionalEnv('GLOBAL_TOPIC', 'chess-global'),
  },
  sentry: {
    dsn: getOptionalEnv('SENTRY_DSN'),
    env: getOptionalEnv('SENTRY_ENV', 'development'),
  },
});
