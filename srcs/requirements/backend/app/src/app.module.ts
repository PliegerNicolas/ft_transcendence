import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Profile } from './profiles/entities/Profile.entity';
import { User } from './users/entities/User.entity';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { RelationshipsModule } from './relationships/relationships.module';
import { Relationship } from './relationships/entities/Relationship.entity';
import { AuthModule } from './auth/auth.module';
import { GamelogsModule } from './gamelogs/gamelogs.module';
import { Gamelog } from './gamelogs/entities/Gamelog.entity';
import { ChatsModule } from './chats/chats.module';
import { Channel } from './chats/channels/entities/Channel.entity';
import { Message } from './chats/messages/entities/Message.entity';
import { AuthService } from './auth/auth.service';
import { GamelogToUser } from './gamelogs/entities/GamelogToUser.entity';
import { ChannelMember } from './chats/channels/entities/ChannelMember.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BigIntSerializationInterceptor } from './common/interceptors/big-int-serialization/big-int-serialization.interceptor';
import { GameModule } from './game/game.module';
import { TwofactorauthService } from './twofactorauth/twofactorauth.service';

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'database',
			port: 5432,
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
			entities: [User, Profile, Relationship, Gamelog, GamelogToUser, Channel, ChannelMember, Message],
			synchronize: true,
			//logging: true, // TEMP
		}),
		UsersModule,
		ProfilesModule,
		RelationshipsModule,
		GamelogsModule,
		AuthModule,
		ChatsModule,
		GameModule
	],
	controllers: [],
	providers: [
		AuthService,
		{
			provide: APP_INTERCEPTOR,
			useClass: BigIntSerializationInterceptor,
		},
		TwofactorauthService,
	],
})
export class AppModule {}
