import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

type ClassContractor = new (...args: unknown[]) => object;

export function Serialize(dto: ClassContractor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassContractor) {}

  intercept(
    context: ExecutionContext,
    handler: CallHandler,
  ): Observable<unknown> {
    return handler.handle().pipe(
      map((data: unknown) => {
        if (typeof data === 'object' && data !== null && 'data' in data) {
          const {
            data: resData,
            count,
            message,
          } = data as Record<string, unknown>;
          return {
            success: true,
            status: context.switchToHttp().getResponse().statusCode,
            message: message || 'OK',
            count: count,
            data: resData,
            // data: plainToInstance(this.dto, resData, {
            //   excludeExtraneousValues: true,
            // }),
          };
        }
        return data;
      }),
    );
  }
}
