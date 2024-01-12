import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './typeorm/entities/User';
import { ProfilesModule } from './profiles/profiles.module';
import { Profile } from './typeorm/entities/Profile';

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
      entities: [User, Profile],
    synchronize: true,
    }),
    UsersModule,
    ProfilesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
