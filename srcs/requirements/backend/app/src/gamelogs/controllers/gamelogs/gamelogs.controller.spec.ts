import { Test, TestingModule } from '@nestjs/testing';
import { GamelogsController } from './gamelogs.controller';

describe('GamelogsController', () => {
  let controller: GamelogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamelogsController],
    }).compile();

    controller = module.get<GamelogsController>(GamelogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
