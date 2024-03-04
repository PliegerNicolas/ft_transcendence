import { Module, forwardRef } from '@nestjs/common';
import { AuthentificationController } from './controllers/authentification/authentification.controller';
import { AuthentificationService } from './services/authentification/authentification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../modules/users/entities/User.entity';
import { Profile } from '../../modules/profiles/entities/Profile.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Profile]),
		/*JwtModule.register({
			secret: process.env.API_SECRET,
			signOptions: { expiresIn: '1h' },
		}),*/
		forwardRef(() => UsersModule),
	],
	controllers: [AuthentificationController],
	providers: [AuthentificationService, JwtService],
	exports: [AuthentificationService, JwtService],
})
export class AuthentificationModule {}
