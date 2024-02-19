import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/Channel.entity';
import { ChannelsService } from './services/channels/channels.service';
import { ChannelsController } from './controllers/channels.controller';
import { User } from 'src/users/entities/User.entity';
import { ChannelMember } from './entities/ChannelMember.entity';
import { AuthService } from 'src/auth/auth.service';
import { PasswordHashingService } from 'src/common/services/password-hashing/password-hashing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, ChannelMember, User]),
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService, AuthService, PasswordHashingService]
})
export class ChannelsModule {}
