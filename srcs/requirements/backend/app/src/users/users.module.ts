import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users/users.controller';
import { UsersService } from './services/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { User } from './entities/User';
import { Profile } from 'src/profiles/entities/Profile';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    ProfilesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
