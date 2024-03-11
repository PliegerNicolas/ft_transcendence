import { Module, forwardRef } from '@nestjs/common';
import { TwoFactorAuthService } from './twofactorauth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/User.entity';
import { UsersModule } from '../modules/users/users.module';
import { TwofactorauthController } from './twofactorauth.controller';
import { Profile } from 'src/modules/profiles/entities/Profile.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constant';
import { ProfilesModule } from 'src/modules/profiles/profiles.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({

	imports: [
		TypeOrmModule.forFeature([User, Profile]),
		JwtModule.register({
			global:true,
			secret:jwtConstants.secret,
			signOptions : {expiresIn: '7200s'}
	  	}),
		forwardRef(() => UsersModule),
		forwardRef(() => ProfilesModule),
		forwardRef(() => AuthModule),
	],
	controllers: [TwofactorauthController],
	providers: [TwoFactorAuthService]
  })
export class TwofactorauthModule {}
