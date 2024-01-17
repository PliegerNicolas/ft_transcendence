import { Module } from '@nestjs/common';
import { GameLogsController } from './controllers/game-logs/game-logs.controller';
import { GameLogsService } from './services/game-logs/game-logs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameLog } from './entities/GameLog';
import { User } from 'src/users/entities/User';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameLog, User])
  ],
  controllers: [GameLogsController],
  providers: [GameLogsService]
})
export class GameLogsModule {}
