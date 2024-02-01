import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/gateways.gateway';
import { MessagesModule } from './messages/messages.module';
import { ChannelsModule } from './channels/channels.module';

@Module({
  imports: [MessagesModule, ChannelsModule],
  providers: [ChatGateway]
})
export class ChatsModule {}
