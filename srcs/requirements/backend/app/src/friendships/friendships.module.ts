import { Module } from '@nestjs/common';
import { FriendshipsController } from './controllers/friendships/friendships.controller';
import { FriendshipsService } from './services/friendships/friendships.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from './entities/Friendships';
import { User } from 'src/users/entities/User';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friendship, User]),
    FriendshipsModule,
  ],
  controllers: [FriendshipsController],
  providers: [FriendshipsService]
})
export class FriendshipsModule {}
