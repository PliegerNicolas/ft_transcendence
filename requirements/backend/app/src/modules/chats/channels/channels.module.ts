import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelsController } from "./controllers/channels.controller";
import { ChannelsService } from "./services/channels/channels.service";
import { Channel } from "./entities/Channel.entity";
import { Message } from "../messages/entities/Message.entity";
import { User } from "../../users/entities/User.entity";
import { ChannelMember } from "./entities/ChannelMember.entity";
import { UsersModule } from "../../users/users.module";
import { PasswordHashingModule } from "../../password-hashing/password-hashing.module";
import { AuthModule } from "../../../auth/auth.module";
import { GuardsModule } from "../../../guards/guards.module";
import { ChannelMembersService } from './services/channel-members/channel-members.service';
import { ChannelCronService } from './services/channel-cron/channel-cron.service';
import { IdPipe } from "src/common/pipes/id/id.pipe";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
	imports: [
		TypeOrmModule.forFeature([Channel, ChannelMember, Message, User]),
		forwardRef(() => UsersModule),
		forwardRef(() => AuthModule),
		forwardRef(() => GuardsModule),
		forwardRef(() => PasswordHashingModule),
	],
	controllers: [ChannelsController],
	providers: [ChannelsService, ChannelMembersService, ChannelCronService, IdPipe],
	exports: [ChannelsService, ChannelMembersService],
})
export class ChannelsModule {}
