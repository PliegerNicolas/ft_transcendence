import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { dbConfig } from "./database-config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { BigIntSerializationInterceptor } from "./common/interceptors/big-int-serialization/big-int-serialization.interceptor";
import { UsersModule } from "./modules/users/users.module";
import { ProfilesModule } from "./modules/profiles/profiles.module";
import { ChatsModule } from "./modules/chats/chats.module";
import { GamelogsModule } from "./modules/gamelogs/gamelogs.module";
import { RelationshipsModule } from "./modules/relationships/relationships.module";
import { PasswordHashingModule } from "./modules/password-hashing/password-hashing.module";
import { GuardsModule } from './guards/guards.module';
import { AuthModule } from "./auth/auth.module";

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forRoot(dbConfig),

		AuthModule,
		GuardsModule,
		PasswordHashingModule,

		UsersModule,
		ProfilesModule,
		ChatsModule,
		GamelogsModule,
		RelationshipsModule,
	],
	controllers: [],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: BigIntSerializationInterceptor,
		},
	],
})
export class AppModule {}
