import { Body, ClassSerializerInterceptor, Controller, ForbiddenException, HttpCode, Post, Request, Res, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TwoFactorAuthService } from './twofactorauth.service';
import { Response } from 'express';
import { TwoFactorAuthCodeDto } from './dtos/TwoFactorAuthCode.dto';
import { UsersService } from '../modules/users/services/users/users.service';
import { AuthService } from 'src/auth/auth.service';


@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwofactorauthController {
	constructor (private readonly twoFactorAuthService: TwoFactorAuthService,
				private usersService: UsersService,
				private authService : AuthService){}

	@UseGuards(AuthGuard('jwt'))
	@Post('generate')
	@HttpCode(200)
	async register(
		@Request() req : any,
		@Res() res : Response
	){
		const { otpauthUrl } = await this.twoFactorAuthService.generateTwoFactorAuthSecret(req.user.oauth_id);

		return this.twoFactorAuthService.pipeQrCodeSteam(res, otpauthUrl)
	}

	@UseGuards(AuthGuard('jwt'))
	@Post('turn-on')
	@HttpCode(200)
	async activateTwoFactorAuth(
		@Request() req : any,
		@Body() {twoFactorAuthCode} : TwoFactorAuthCodeDto
	){
		const user = req.user
		console.log(user.id)

		const isCodeValid = await this.twoFactorAuthService.isTwoFactorAuthSecretValid(
			twoFactorAuthCode, user.id
		  ).then((data) => data);
		  console.log(isCodeValid)
		  if (!isCodeValid) {
			throw new ForbiddenException('Wrong authentication code');
		  }
		  console.log(user.id)
		  await this.usersService.turnOnTwoFactorAuthentication(user.id);
		  return {access_token: await this.authService.createJwt({user_id : user.id, oauth_id : user.oauth_id, isTwoFactorAuthEnabled: user.isTwoFactorAuthEnabled}, true)};
	}

	@UseGuards(AuthGuard('jwt'))
	@Post('authenticate')
	@HttpCode(200)
	async authenticate(
		@Request() req : any,
		@Body() {twoFactorAuthCode} : TwoFactorAuthCodeDto
	){
		const user = req.user;
		const isCodeValid = this.twoFactorAuthService.isTwoFactorAuthSecretValid(
			twoFactorAuthCode, req.user.user_id
		  );
		  if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		  }
		  return {access_token: await this.authService.createJwt({user_id : user.id, oauth_id : user.oauth_id, isTwoFactorAuthEnabled: user.isTwoFactorAuthEnabled}, true)};
	}

}
