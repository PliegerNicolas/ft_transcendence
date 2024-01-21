import { Module } from '@nestjs/common';
import { GamelogsController } from './controllers/gamelogs/gamelogs.controller';
import { GamelogsService } from './services/gamelogs/gamelogs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gamelog } from './entities/Gamelog';
import { User } from 'src/users/entities/User';
import { UserToGamelog } from './entities/UserToGamelog';
import { ArraySizeMatchValidator } from './validators/ArraySizeMatchValidator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gamelog, UserToGamelog, User]),
  ],
  controllers: [GamelogsController],
  providers: [GamelogsService]
})
export class GamelogsModule {}
