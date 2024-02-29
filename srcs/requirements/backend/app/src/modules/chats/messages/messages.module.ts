import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessagesService } from "./services/messages.service";
import { MessagesController } from "./controllers/messages.controller";
import { Message } from "./entities/Message.entity";
import { Channel } from "../channels/entities/Channel.entity";
import { ChannelMember } from "../channels/entities/ChannelMember.entity";
import { User } from "../../users/entities/User.entity";
import { PasswordHashingService } from "../../../common/services/password-hashing/password-hashing.service";
import { AuthentificationModule } from "../../../authorization-and-authentification/authentification/authentification.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Message, Channel, ChannelMember, User]),
		AuthentificationModule,
	],
	controllers: [MessagesController],
	providers: [MessagesService, PasswordHashingService],
	exports: [MessagesService],
})
export class MessagesModule {}
