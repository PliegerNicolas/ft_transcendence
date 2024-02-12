import { Module } from '@nestjs/common';
import { GamelogsController } from './controllers/gamelogs/gamelogs.controller';
import { GamelogsService } from './services/gamelogs/gamelogs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gamelog } from './entities/Gamelog.entity';
import { UserToGamelog } from './entities/UserToGamelog.entity';
import { User } from 'src/users/entities/User.entity';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gamelog, UserToGamelog, User]),
  ],
  controllers: [GamelogsController],
  providers: [GamelogsService, AuthService]
})
export class GamelogsModule {}
