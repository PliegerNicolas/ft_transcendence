import { Module, forwardRef } from '@nestjs/common';
import { TwoFactorAuthentificationController } from './controllers/two-factor-authentification/two-factor-authentification.controller';
import { TwoFactorAuthentificationService } from './services/two-factor-authentification/two-factor-authentification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../modules/users/entities/User.entity';
import { UsersModule } from '../../modules/users/users.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		forwardRef(() => UsersModule),
	],
	controllers: [TwoFactorAuthentificationController],
	providers: [TwoFactorAuthentificationService],
	exports: [TwoFactorAuthentificationService],
})
export class TwoFactorAuthentificationModule {}
