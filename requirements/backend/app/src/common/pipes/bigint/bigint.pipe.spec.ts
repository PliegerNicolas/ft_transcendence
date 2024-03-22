import { EntityManager } from 'typeorm';
import { BigintPipe } from './bigint.pipe';

describe('BigintPipe', () => {
	it('should be defined', () => {
		const mockEntityManager = {} as EntityManager;
		expect(new BigintPipe(mockEntityManager)).toBeDefined();
	});
});