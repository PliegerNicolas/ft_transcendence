import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { RelationshipsModule } from './relationships/relationships.module';
import { AuthModule } from './auth/auth.module';
import { GamelogsModule } from './gamelogs/gamelogs.module';
import { ChatsModule } from './chats/chats.module';
import { AuthService } from './auth/auth.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BigIntSerializationInterceptor } from './common/interceptors/big-int-serialization/big-int-serialization.interceptor';
import { GameModule } from './game/game.module';
import { PasswordHashingService } from './common/services/password-hashing/password-hashing.service';
import { TwoFactorAuthService } from './twofactorauth/twofactorauth.service';
import { UsersService } from './users/services/users/users.service';
import { TwofactorauthModule } from './twofactorauth/twofactorauth.module';
import { dbConfig } from './database-config';

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forRoot(dbConfig),
		UsersModule,
		ProfilesModule,
		RelationshipsModule,
		GamelogsModule,
		AuthModule,
		ChatsModule,
		GameModule,
		TwofactorauthModule
	],
	controllers: [],
	providers: [
		AuthService,
		{
			provide: APP_INTERCEPTOR,
			useClass: BigIntSerializationInterceptor,
		},
		PasswordHashingService
	],
})
export class AppModule {}
