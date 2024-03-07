import { Module } from '@nestjs/common';
import { GamelogsModule } from 'src/modules/gamelogs/gamelogs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamelogToUser } from 'src/modules/gamelogs/entities/GamelogToUser.entity';
import { Gamelog } from 'src/modules/gamelogs/entities/Gamelog.entity';
import { User } from 'src/modules/users/entities/User.entity';
import { UsersModule } from 'src/modules/users/users.module';
import { SocketGateway } from './gateways/socket.gateway';
import { GameModule } from 'src/modules/game/game.module';
import { ChannelsModule } from 'src/modules/chats/channels/channels.module';
import { Channel } from 'src/modules/chats/channels/entities/Channel.entity';


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