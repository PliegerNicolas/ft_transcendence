import { Module } from "@nestjs/common";
import { MessagesModule } from "./messages/messages.module";
import { ChannelsModule } from "./channels/channels.module";
import { ChatGateway } from "./gateways/gateways.gateway";

@Module({
	imports: [MessagesModule, ChannelsModule],
	controllers: [],
	providers: [ChatGateway],
	exports: [MessagesModule, ChannelsModule],
})
export class ChatsModule {}
