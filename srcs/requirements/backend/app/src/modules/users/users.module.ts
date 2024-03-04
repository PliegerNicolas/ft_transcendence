import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersController } from "./controllers/users/users.controller";
import { UsersService } from "./services/users/users.service";
import { User } from "./entities/User.entity";
import { Profile } from "../profiles/entities/Profile.entity";
import { Relationship } from "../relationships/entities/Relationship.entity";
import { GamelogToUser } from "../gamelogs/entities/GamelogToUser.entity";
import { Channel } from "../chats/channels/entities/Channel.entity";
import { ChannelMember } from "../chats/channels/entities/ChannelMember.entity";
import { AuthModule } from "../../auth/auth.module";
import { GuardsModule } from "../../guards/guards.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Profile, Relationship, GamelogToUser, Channel, ChannelMember]),
		forwardRef(() => AuthModule),
		forwardRef(() => GuardsModule),
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
