import { Test, TestingModule } from '@nestjs/testing';
import { GameLogsController } from './game-logs.controller';

describe('GameLogsController', () => {
  let controller: GameLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameLogsController],
    }).compile();

    controller = module.get<GameLogsController>(GameLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
