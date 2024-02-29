import { Module } from '@nestjs/common';
import { AuthentificationModule } from './authentification/authentification.module';
import { TwoFactorAuthentificationModule } from './two-factor-authentification/two-factor-authentification.module';
import { GuardsModule } from './guards/guards.module';

@Module({
	imports: [AuthentificationModule, TwoFactorAuthentificationModule, GuardsModule],
	providers: [],
	exports: [AuthentificationModule, TwoFactorAuthentificationModule, GuardsModule],
})
export class AuthoriationAndAuthentificationModule {}
