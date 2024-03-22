import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHashingController } from './password-hashing.controller';

describe('PasswordHashingController', () => {
  let controller: PasswordHashingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PasswordHashingController],
    }).compile();

    controller = module.get<PasswordHashingController>(PasswordHashingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
