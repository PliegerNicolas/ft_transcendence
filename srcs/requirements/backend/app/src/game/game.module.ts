import { Module } from '@nestjs/common';
import { GameGateway } from './gateways/gateways.gateway';
import { GamelogsModule } from 'src/gamelogs/gamelogs.module';
import { GameService } from './services/game.service';

@Module({
  imports: [GamelogsModule],
  providers: [GameGateway, GameService]
})
export class GameModule {}
