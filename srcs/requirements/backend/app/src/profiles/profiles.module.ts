import { Module } from '@nestjs/common';
import { ProfilesController } from './controllers/profiles/profiles.controller';
import { ProfilesService } from './services/profiles/profiles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/Profile';
import { User } from 'src/users/entities/User';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, User]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService]
})
export class ProfilesModule {}
