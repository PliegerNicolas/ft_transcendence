import { Module, forwardRef } from '@nestjs/common';
import { TwoFactorAuthService } from './twofactorauth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/User.entity';
import { UsersModule } from '../modules/users/users.module';
import { TwofactorauthController } from './twofactorauth.controller';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/modules/users/services/users/users.service';
import { Profile } from 'src/modules/profiles/entities/Profile.entity';
import { ProfilesService } from 'src/modules/profiles/services/profiles/profiles.service';

@Module({

	imports: [TypeOrmModule.forFeature([User, Profile])],
	controllers: [TwofactorauthController],
	providers: [TwoFactorAuthService, UsersService, ProfilesService, AuthService]
  })
export class TwofactorauthModule {}
