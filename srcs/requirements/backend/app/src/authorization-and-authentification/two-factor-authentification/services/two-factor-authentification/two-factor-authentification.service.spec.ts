import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorAuthentificationService } from './two-factor-authentification.service';

describe('TwoFactorAuthentificationService', () => {
  let service: TwoFactorAuthentificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TwoFactorAuthentificationService],
    }).compile();

    service = module.get<TwoFactorAuthentificationService>(TwoFactorAuthentificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
