import { EntityManager } from 'typeorm';
import { IdPipe } from './id.pipe';

describe('IdPipe', () => {
	it('should be defined', () => {
		const entityManagerMock: Partial<EntityManager> = {};
		expect(new IdPipe(entityManagerMock as EntityManager)).toBeDefined();
	});
});