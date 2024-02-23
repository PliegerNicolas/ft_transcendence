import { Module } from '@nestjs/common';
import { GamelogsController } from './controllers/gamelogs/gamelogs.controller';
import { GamelogsService } from './services/gamelogs/gamelogs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gamelog } from './entities/Gamelog.entity';
import { User } from 'src/users/entities/User.entity';
import { GamelogToUser } from './entities/GamelogToUser.entity';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gamelog, GamelogToUser, User]),
  ],
  controllers: [GamelogsController],
  providers: [GamelogsService, AuthService],
  exports: [GamelogsService]
})
export class GamelogsModule {}
