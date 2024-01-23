import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Profile } from './profiles/entities/Profile';
import { User } from './users/entities/User';
import { GameLog } from './game-logs/entities/GameLog';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { GameLogsModule } from './game-logs/game-logs.module';
import { RelationshipsModule } from './relationships/relationships.module';
import { Relationship } from './relationships/entities/Relationship';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';

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
      entities: [User, Profile, GameLog, Relationship],
    synchronize: true,
    }),
    UsersModule,
    ProfilesModule,
    RelationshipsModule,
    GameLogsModule,
	  AuthModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
