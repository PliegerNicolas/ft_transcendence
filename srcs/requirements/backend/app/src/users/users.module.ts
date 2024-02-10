import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users/users.controller';
import { UsersService } from './services/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User.entity';
import { Profile } from 'src/profiles/entities/Profile.entity';
import { Relationship } from 'src/relationships/entities/Relationship.entity';
import { Gamelog } from 'src/gamelogs/entities/Gamelog.entity';
import { Channel } from 'diagnostics_channel';
import { Message } from 'src/chats/messages/entities/Message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Relationship, Gamelog, Channel, Message])
  ],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
