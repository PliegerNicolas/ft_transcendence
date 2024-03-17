import { Reflector } from '@nestjs/core';
import { SerializeInterceptor } from './serialize.interceptor';

describe('SerializeInterceptor', () => {
	it('should be defined', () => {
		const reflector: Reflector = new Reflector();
		expect(new SerializeInterceptor(reflector)).toBeDefined();
	});
});