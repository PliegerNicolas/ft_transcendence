import { Test, TestingModule } from '@nestjs/testing';
import { GamelogsService } from './gamelogs.service';

describe('GamelogsService', () => {
  let service: GamelogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamelogsService],
    }).compile();

    service = module.get<GamelogsService>(GamelogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
