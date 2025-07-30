import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import morgan from 'morgan';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { ValidationError } from 'class-validator';
import { RateLimiterMemory } from 'rate-limiter-flexible'; // Better alternative
import './utils/instrument';
import { AllExceptionFilter } from './common/filters';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Proper morgan middleware setup
  app.use(morgan('tiny'));

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: 'Authorization, Content-Type',
    credentials: true,
  });

  // Better rate limiting implementation
  const rateLimiter = new RateLimiterMemory({
    points: 100, // Number of points
    duration: 60, // Per 60 seconds
  });

  app.use(async (req, res, next) => {
    try {
      const rateLimiterRes = await rateLimiter.consume(req.ip);
      res.set({
        'Retry-After': rateLimiterRes.msBeforeNext / 1000,
        'X-RateLimit-Limit': 100,
        'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
      });
      next();
    } catch (rateLimiterRes) {
      res.set({
        'Retry-After': rateLimiterRes.msBeforeNext / 1000,
      });
      return res.status(429).send('Too Many Requests');
    }
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        if (validationErrors.length > 0) {
          if (
            validationErrors[0].children &&
            validationErrors[0].children.length > 0
          ) {
            const childError = validationErrors[0].children[0];
            if (childError.constraints) {
              return new BadRequestException(
                Object.values(childError.constraints)[0],
              );
            }
          }
          if (validationErrors[0].constraints) {
            return new BadRequestException(
              Object.values(validationErrors[0].constraints)[0],
            );
          }
        }
        return new BadRequestException('Validation failed');
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'refresh-token',
    )
    .addServer(`${process.env.BASE_URL}${process.env.API}`)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(configService.get<number>('PORT') || 3000);
}

bootstrap();
