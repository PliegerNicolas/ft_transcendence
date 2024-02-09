import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users/users.controller';
import { UsersService } from './services/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User.entity';
import { Profile } from 'src/profiles/entities/Profile.entity';
import { Relationship } from 'src/relationships/entities/Relationship.entity';
import { Gamelog } from 'src/gamelogs/entities/Gamelog.entity';
import { UserToGamelog } from 'src/gamelogs/entities/UserToGamelog.entity';
import { Channel } from 'diagnostics_channel';
import { Message } from 'src/chats/messages/entities/Message.entity';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Relationship, Gamelog, UserToGamelog, Channel, Message])
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService]
})
export class UsersModule {}
