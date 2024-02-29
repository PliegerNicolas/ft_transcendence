import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorAuthentificationController } from './two-factor-authentification.controller';

describe('TwoFactorAuthentificationController', () => {
  let controller: TwoFactorAuthentificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwoFactorAuthentificationController],
    }).compile();

    controller = module.get<TwoFactorAuthentificationController>(TwoFactorAuthentificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
