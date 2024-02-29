import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersController } from "./controllers/users/users.controller";
import { UsersService } from "./services/users/users.service";
import { User } from "./entities/User.entity";
import { Profile } from "../profiles/entities/Profile.entity";
import { Relationship } from "../relationships/entities/Relationship.entity";
import { GamelogToUser } from "../gamelogs/entities/GamelogToUser.entity";
import { Channel } from "../chats/channels/entities/Channel.entity";
import { ChannelMember } from "../chats/channels/entities/ChannelMember.entity";
import { AuthoriationAndAuthentificationModule } from "../../authorization-and-authentification/authoriation-and-authentification.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Profile, Relationship, GamelogToUser, Channel, ChannelMember]),
		AuthoriationAndAuthentificationModule,
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
