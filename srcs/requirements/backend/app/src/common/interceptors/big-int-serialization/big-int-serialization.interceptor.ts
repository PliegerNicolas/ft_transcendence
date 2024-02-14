import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class BigIntSerializationInterceptor implements NestInterceptor {

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		return next.handle().pipe(
			map((data) => this.serializeBigInts(data))
		);
	}

	private serializeBigInts(data: any): any {
		if (data instanceof Object) {
			for (const key in data) {
				if (typeof data[key] === 'bigint') data[key] = data[key].toString();
				else if (data[key] instanceof Object) this.serializeBigInts(data[key]);
			}
		}

		return (data);
	}

}