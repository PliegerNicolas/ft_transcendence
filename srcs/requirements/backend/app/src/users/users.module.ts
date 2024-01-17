import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users/users.controller';
import { UsersService } from './services/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User';
import { Profile } from 'src/profiles/entities/Profile';
import { Relationship } from 'src/relationships/entities/Relationship';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Relationship])
  ],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
