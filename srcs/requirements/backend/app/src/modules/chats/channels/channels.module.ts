import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelsController } from "./controllers/channels.controller";
import { ChannelsService } from "./services/channels/channels.service";
import { Channel } from "./entities/Channel.entity";
import { Message } from "../messages/entities/Message.entity";
import { User } from "../../users/entities/User.entity";
import { ChannelMember } from "./entities/ChannelMember.entity";
import { PasswordHashingService } from "../../../common/services/password-hashing/password-hashing.service";
import { UsersService } from "../../users/services/users/users.service";
import { AuthentificationModule } from "../../../authorization-and-authentification/authentification/authentification.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Channel, ChannelMember, Message, User]),
		AuthentificationModule,
	],
	controllers: [ChannelsController],
	providers: [ChannelsService, UsersService, PasswordHashingService],
	exports: [ChannelsService],
})
export class ChannelsModule {}
