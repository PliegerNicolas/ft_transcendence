import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelsController } from "./controllers/channels.controller";
import { ChannelsService } from "./services/channels/channels.service";
import { Channel } from "./entities/Channel.entity";
import { Message } from "../messages/entities/Message.entity";
import { User } from "../../users/entities/User.entity";
import { ChannelMember } from "./entities/ChannelMember.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([Channel, ChannelMember, Message, User]),
	],
	controllers: [ChannelsController],
	providers: [ChannelsService],
})
export class ChannelsModule {}
