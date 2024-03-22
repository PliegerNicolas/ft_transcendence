import { Module } from '@nestjs/common';
import { GamelogsModule } from 'src/modules/gamelogs/gamelogs.module';
import { GameService } from './services/game.service';
import { GamelogsService } from 'src/modules/gamelogs/services/gamelogs/gamelogs.service';
import { GameServer } from './server/game.server';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamelogToUser } from 'src/modules/gamelogs/entities/GamelogToUser.entity';
import { Gamelog } from 'src/modules/gamelogs/entities/Gamelog.entity';
import { User } from 'src/modules/users/entities/User.entity';
import { UsersModule } from 'src/modules/users/users.module';
import { ProfilesModule } from '../profiles/profiles.module';


@Module({
  imports: [GamelogsModule, UsersModule, ProfilesModule, TypeOrmModule.forFeature([Gamelog, GamelogToUser, User])],
  providers: [GameService, GamelogsService, GameServer],
  exports: [GameService, GameServer]
})
export class GameModule {}
