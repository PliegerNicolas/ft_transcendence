import { Module, forwardRef } from '@nestjs/common';
import { TwoFactorAuthService } from './twofactorauth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
<<<<<<< HEAD
import { User } from 'src/users/entities/User.entity';
import { Profile } from 'src/profiles/entities/Profile.entity';
import { ProfilesService } from 'src/profiles/services/profiles/profiles.service';
import { TwofactorauthController } from './twofactorauth.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({

	imports: [TypeOrmModule.forFeature([User, Profile])],
	controllers: [TwofactorauthController],
	providers: [TwoFactorAuthService, UsersService, ProfilesService, AuthService]
  })
=======
import { User } from 'src/modules/users/entities/User.entity';
import { UsersModule } from '../modules/users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(() => UsersModule),
    ],
    controllers: [],
    providers: [TwoFactorAuthService],
    exports: [TwoFactorAuthService],
})
>>>>>>> 40da91c0b19d551e67780f308c60ef899f57a7ea
export class TwofactorauthModule {}
