import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/Channel.entity';
import { ChannelsService } from './services/channels/channels.service';
import { ChannelsController } from './controllers/channels.controller';
import { User } from 'src/users/entities/User.entity';
import { ChannelMember } from './entities/ChannelMember.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, ChannelMember, User]),
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService]
})
export class ChannelsModule {}
