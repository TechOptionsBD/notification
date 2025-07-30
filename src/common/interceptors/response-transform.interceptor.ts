import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface Response<T> {
  success: boolean;
  message: string;
  count: number;
  data: T;
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    handler: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    // response = ctx.getResponse<Response<T>>();

    return handler.handle().pipe(
      map((data) => {
        const { data: resData, count, message } = data;
        return {
          success: true,
          message: message || 'OK',
          count: count,
          data: resData || data,
        };
      }),
    );
  }
}
