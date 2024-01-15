import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { FriendshipsService } from './friendships/services/friendships/friendships.service';
import { FriendshipsModule } from './friendships/friendships.module';
import { Friendship } from './friendships/entities/Friendships';
import { Profile } from './profiles/entities/Profile';
import { User } from './users/entities/User';

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
      entities: [User, Profile, Friendship],
    synchronize: true,
    }),
    UsersModule,
    ProfilesModule,
    FriendshipsModule,
    /*AuthModule*/],
  controllers: [],
  providers: [],
})
export class AppModule {}
