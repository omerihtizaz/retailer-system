import {
  NestInterceptor,
  UseInterceptors,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { plainToInstance } from 'class-transformer';
export function Serialize(dto: any) {
  return UseInterceptors(new SerializeInterceptor(dto));
}
export class SerializeInterceptor implements NestInterceptor {
  constructor(private typeDto: any) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        return plainToInstance(this.typeDto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
