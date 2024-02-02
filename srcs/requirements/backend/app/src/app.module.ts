import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Profile } from './profiles/entities/Profile';
import { User } from './users/entities/User';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { RelationshipsModule } from './relationships/relationships.module';
import { Relationship } from './relationships/entities/Relationship';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GamelogsModule } from './gamelogs/gamelogs.module';
import { Gamelog } from './gamelogs/entities/Gamelog';
import { UserToGamelog } from './gamelogs/entities/UserToGamelog';
// import { AppController } from './app.controller';
import { AuthService } from './auth/auth.service';

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
      entities: [User, Profile, Relationship, Gamelog, UserToGamelog],
      synchronize: true,
      //logging: true, // TEMP
    }),
    UsersModule,
    ProfilesModule,
    RelationshipsModule,
    GamelogsModule,
	AuthModule,
    ChatModule,
  ],
  controllers: [],
  providers: [AuthService],
})
export class AppModule {}
