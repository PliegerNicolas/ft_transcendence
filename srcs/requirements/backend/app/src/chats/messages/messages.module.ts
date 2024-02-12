import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/Message.entity';
import { MessagesController } from './controllers/messages.controller';
import { MessagesService } from './services/messages.service';
import { Channel } from '../channels/entities/Channel.entity';
import { User } from 'src/users/entities/User.entity';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Channel, User]),
  ],
  providers: [MessagesService, AuthService],
  controllers: [MessagesController]
})
export class MessagesModule {}
