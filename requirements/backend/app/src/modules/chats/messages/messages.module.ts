import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessagesController } from "./controllers/messages.controller";
import { Message } from "./entities/Message.entity";
import { Channel } from "../channels/entities/Channel.entity";
import { ChannelMember } from "../channels/entities/ChannelMember.entity";
import { User } from "../../users/entities/User.entity";
import { UsersModule } from "../../../modules/users/users.module";
import { AuthModule } from "../../../auth/auth.module";
import { GuardsModule } from "../../../guards/guards.module";
import { MessagesRightsService } from './services/messages-rights/messages-rights.service';
import { MessagesService } from "./services/messages/messages.service";
import { ChannelsModule } from "../channels/channels.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([Message, Channel, ChannelMember, User]),
		forwardRef(() => UsersModule),
		forwardRef(() => ChannelsModule),
		forwardRef(() => AuthModule),
		forwardRef(() => GuardsModule),
	],
	controllers: [MessagesController],
	providers: [MessagesService, MessagesRightsService],
	exports: [MessagesService, MessagesRightsService],
})
export class MessagesModule {}
