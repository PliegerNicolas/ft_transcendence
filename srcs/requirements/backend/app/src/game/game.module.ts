import { Module } from '@nestjs/common';
import { GameGateway } from './gateways/gateways.gateway';
import { GamelogsModule } from 'src/gamelogs/gamelogs.module';
import { GameService } from './services/game.service';
import { GamelogsService } from 'src/gamelogs/services/gamelogs/gamelogs.service';
import { GameServer } from './server/game.server';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamelogToUser } from 'src/gamelogs/entities/GamelogToUser.entity';
import { Gamelog } from 'src/gamelogs/entities/Gamelog.entity';
import { User } from 'src/users/entities/User.entity';


@Module({
  imports: [GamelogsModule, TypeOrmModule.forFeature([Gamelog, GamelogToUser, User])],
  providers: [GameGateway, GameService, GamelogsService, GameServer]
})
export class GameModule {}
