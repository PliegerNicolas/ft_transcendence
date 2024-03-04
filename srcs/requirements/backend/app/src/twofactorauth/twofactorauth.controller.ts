import { Body, ClassSerializerInterceptor, Controller, HttpCode, Post, Request, Res, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TwoFactorAuthService } from './twofactorauth.service';
import { Response } from 'express';
import { TwoFactorAuthCodeDto } from './dtos/TwoFactorAuthCode.dto';
import { UsersService } from '../modules/users/services/users/users.service';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwofactorauthController {
	constructor (private readonly twoFactorAuthService: TwoFactorAuthService,
				private usersService: UsersService){}

	@Post('generate')
	@HttpCode(200)
	@UseGuards(AuthGuard('jwt'))
	async register(
		@Request() req : any,
		@Res() res : Response
	){
		const { otpauthUrl } = await this.twoFactorAuthService.generateTwoFactorAuthSecret(req.user.oauth_id);

		return this.twoFactorAuthService.pipeQrCodeSteam(res, otpauthUrl)
	}

	@Post('turn-on')
	@HttpCode(200)
	@UseGuards(AuthGuard('jwt'))
	async activateTwoFactorAuth(
		@Request() req : any,
		@Body() {twoFactorAuthCode} : TwoFactorAuthCodeDto
	){
		const isCodeValid = this.twoFactorAuthService.isTwoFactorAuthSecretValid(
			twoFactorAuthCode, req.user.user_id
		  );
		  if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		  }
		  await this.usersService.turnOnTwoFactorAuthentication(req.user.user_id);
	}

}
