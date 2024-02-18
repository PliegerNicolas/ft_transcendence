import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { User } from "./users/entities/User.entity";
import { Profile } from "./profiles/entities/Profile.entity";
import { Relationship } from "./relationships/entities/Relationship.entity";
import { Gamelog } from "./gamelogs/entities/Gamelog.entity";
import { GamelogToUser } from "./gamelogs/entities/GamelogToUser.entity";
import { ChannelMember } from "./chats/channels/entities/ChannelMember.entity";
import { Message } from "./chats/messages/entities/Message.entity";
import { Channel } from "./chats/channels/entities/Channel.entity";

const { TypeOrmModuleOptions } = require('@nestjs/typeorm');

const dbConfig: TypeOrmModuleOptions = {
	type: 'postgres',
	host: 'database',
	port: 5432,
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DB,
	entities: [
		User,
		Profile,
		Relationship,
		Gamelog,
		GamelogToUser,
		Channel,
		ChannelMember,
		Message,
	],
	synchronize: true,
	//logging: true, // TEMP
};

module.exports = dbConfig;
