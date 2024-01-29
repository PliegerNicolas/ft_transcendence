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
import { UserToGamelog } from './gamelogs/entities/UserToGamelog.entity';
import { ChatsModule } from './chats/chats.module';
import { Channel } from './chats/channels/entities/Channel.entity';
import { Message } from './chats/messages/entities/Message.entity';

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
      entities: [User, Profile, Relationship, Gamelog, UserToGamelog, Channel, Message],
      synchronize: true,
      //logging: true, // TEMP
    }),
    UsersModule,
    ProfilesModule,
    RelationshipsModule,
    GamelogsModule,
	  AuthModule,
    ChatsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
