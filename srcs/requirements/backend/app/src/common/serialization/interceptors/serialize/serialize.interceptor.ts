import { CallHandler, ClassSerializerInterceptor, ClassSerializerInterceptorOptions, ExecutionContext, Inject, Injectable, PlainLiteralObject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

const serializeOptions: ClassSerializerInterceptorOptions = {
    strategy: 'exposeAll',
    enableCircularCheck: true,
    excludeExtraneousValues: false,
    enableImplicitConversion: true,
    excludePrefixes: ['_'],
};

@Injectable()
export class SerializeInterceptor extends ClassSerializerInterceptor {

	constructor(@Inject(Reflector) reflector: Reflector) {
		super(reflector, serializeOptions)
	}

	intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
		return (super.intercept(context, next))
	}

}