import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users/users.controller';
import { UsersService } from './services/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User';
import { Profile } from 'src/profiles/entities/Profile';
import { Relationship } from 'src/relationships/entities/Relationship';
import { Gamelog } from 'src/gamelogs/entities/Gamelog';
import { ChannelMember } from 'src/chats/channels/entities/ChannelMember';
import { UserToGamelog } from 'src/gamelogs/entities/UserToGamelog';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Relationship, Gamelog, UserToGamelog, ChannelMember])
  ],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
