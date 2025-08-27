import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() === 'http') {
      const ctx = context.switchToHttp();
      const request = ctx.getRequest<Request>();
      const response = ctx.getResponse<Response>(); // Fixed: was using getRequest instead of getResponse

      return next.handle().pipe(
        tap((data) => {
          const reqDetails = {
            method: request.method,
            queryParams: request.query,
            body: request.body,
            requestedEndpoint: request.originalUrl,
            responseBody: data,
            status: response.statusCode,
          };
          Logger.log(JSON.stringify(reqDetails), 'RequestLoggingInterceptor');
        }),
      );
    }
    // Return the unmodified stream for non-HTTP contexts
    return next.handle();
  }
}
