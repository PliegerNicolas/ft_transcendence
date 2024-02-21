import { Test, TestingModule } from '@nestjs/testing';
import { TwofactorauthService } from './twofactorauth.service';

describe('TwofactorauthService', () => {
  let service: TwofactorauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TwofactorauthService],
    }).compile();

    service = module.get<TwofactorauthService>(TwofactorauthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
