import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessagesService } from "./services/messages.service";
import { MessagesController } from "./controllers/messages.controller";
import { Message } from "./entities/Message.entity";
import { Channel } from "../channels/entities/Channel.entity";
import { ChannelMember } from "../channels/entities/ChannelMember.entity";
import { User } from "../../users/entities/User.entity";
import { PasswordHashingModule } from "../../password-hashing/password-hashing.module";
import { UsersModule } from "src/modules/users/users.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Message, Channel, ChannelMember, User]),
		forwardRef(() => UsersModule),
		forwardRef(() => PasswordHashingModule),
	],
	controllers: [MessagesController],
	providers: [MessagesService],
	exports: [MessagesService],
})
export class MessagesModule {}
