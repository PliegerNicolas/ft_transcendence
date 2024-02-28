import { Test, TestingModule } from '@nestjs/testing';
import { TwofactorauthController } from './twofactorauth.controller';

describe('TwofactorauthController', () => {
  let controller: TwofactorauthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwofactorauthController],
    }).compile();

    controller = module.get<TwofactorauthController>(TwofactorauthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
