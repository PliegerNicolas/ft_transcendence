import { TypeormExceptionFilter } from './typeorm-exception.filter';

describe('TypeormExceptionFilter', () => {
  it('should be defined', () => {
    expect(new TypeormExceptionFilter()).toBeDefined();
  });
});
