import { Module } from '@nestjs/common';
import { ControllersController } from './controllers/controllers.controller';
import { ServicesService } from './services/services.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/Channel';
import { ChannelMember } from './entities/ChannelMember';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, ChannelMember]),
  ],
  controllers: [ControllersController],
  providers: [ServicesService]
})
export class ChannelsModule {}
