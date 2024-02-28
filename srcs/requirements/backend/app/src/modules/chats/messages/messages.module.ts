import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessagesService } from "./services/messages.service";
import { MessagesController } from "./controllers/messages.controller";
import { Message } from "./entities/Message.entity";
import { Channel } from "../channels/entities/Channel.entity";
import { ChannelMember } from "../channels/entities/ChannelMember.entity";
import { User } from "../../users/entities/User.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([Message, Channel, ChannelMember, User]),
	],
	controllers: [MessagesController],
	providers: [MessagesService],
})
export class MessagesModule {}
