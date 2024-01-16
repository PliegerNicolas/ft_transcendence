import { Module } from '@nestjs/common';
import { GameLogsController } from './controllers/game-logs/game-logs.controller';
import { GameLogsService } from './services/game-logs/game-logs.service';

@Module({
  controllers: [GameLogsController],
  providers: [GameLogsService]
})
export class GameLogsModule {}
