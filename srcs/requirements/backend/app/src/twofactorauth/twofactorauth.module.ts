import { Module } from '@nestjs/common';
import { TwoFactorAuthService } from './twofactorauth.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/services/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/User.entity';
import { Profile } from 'src/profiles/entities/Profile.entity';
import { ProfilesService } from 'src/profiles/services/profiles/profiles.service';

@Module({

	imports: [TypeOrmModule.forFeature([User, Profile])],
	controllers: [],
	providers: [TwoFactorAuthService, UsersService, ProfilesService]
  })
export class TwofactorauthModule {}
