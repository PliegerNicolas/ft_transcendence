import { Module } from '@nestjs/common';
import { GameGateway } from './gateways/gateways.gateway';
import { GamelogsModule } from 'src/gamelogs/gamelogs.module';
import { GameService } from './services/game.service';
import { GamelogsService } from 'src/gamelogs/services/gamelogs/gamelogs.service';
import { GameServer } from './server/game.server';

@Module({
  imports: [GamelogsModule],
  providers: [GameGateway, GameService, GamelogsService, GameServer]
})
export class GameModule {}
