import { Module } from '@nestjs/common';
import { GamelogsModule } from 'src/gamelogs/gamelogs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamelogToUser } from 'src/gamelogs/entities/GamelogToUser.entity';
import { Gamelog } from 'src/gamelogs/entities/Gamelog.entity';
import { User } from 'src/users/entities/User.entity';
import { UsersModule } from 'src/users/users.module';
import { SocketGateway } from './gateways/socket.gateway';
import { GameModule } from 'src/game/game.module';
import { ChannelsModule } from 'src/chats/channels/channels.module';
import { Channel } from 'src/chats/channels/entities/Channel.entity';


@Module({
  imports: [
    GameModule,
    GamelogsModule,
    UsersModule,
    TypeOrmModule.forFeature([Gamelog, GamelogToUser, User, Channel]),
    ChannelsModule],
  providers: [SocketGateway],
})
export class SocketModule {}