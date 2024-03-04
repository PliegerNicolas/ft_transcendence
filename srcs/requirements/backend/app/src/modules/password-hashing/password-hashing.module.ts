import { Module } from '@nestjs/common';
import { PasswordHashingController } from './controllers/password-hashing/password-hashing.controller';
import { PasswordHashingService } from './services/password-hashing/password-hashing.service';

@Module({
	imports: [],
	controllers: [PasswordHashingController],
	providers: [PasswordHashingService],
	exports: [PasswordHashingService],
})
export class PasswordHashingModule {}
