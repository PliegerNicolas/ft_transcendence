import { Module } from '@nestjs/common';
import { MessagesModule } from './messages/messages.module';
import { ChannelsModule } from './channels/channels.module';

@Module({
  imports: [MessagesModule, ChannelsModule],
  providers: []
})
export class ChatsModule {}
