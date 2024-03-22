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
		@Res() res : Response,
		@Body() {twoFactorAuthCode} : TwoFactorAuthCodeDto
	){
		const user = req.user
		// console.log(user.id)

		const isCodeValid = await this.twoFactorAuthService.isTwoFactorAuthSecretValid(
			twoFactorAuthCode, user.id
		  ).then((data) => data);
		//   console.log(isCodeValid)
		  if (!isCodeValid) {
			throw new ForbiddenException('Wrong authentication code');
		  }
		  await this.usersService.turnOnTwoFactorAuthentication(user.id);
		  const access_token = await this.authService.createJwt({user_id : user.id, oauth_id : user.oauth_id, isTwoFactorAuthEnabled: user.isTwoFactorAuthEnabled}, true)
		  const refresh_token = await this.authService.createRefreshToken({user_id : user.id, account_name :user.account_name, isTwoFactorAuthEnabled: user.isTwoFactorAuthEnabled}, true)
		  res.cookie("access_token", access_token,{maxAge: 1600000, httpOnly: true, sameSite: 'none', secure:true });
		  res.cookie("refresh_token", refresh_token, {maxAge: 86400000, httpOnly: true, sameSite: 'none', secure:true})
		  res.json({username: user.username})
		  res.send();
		  return ;
	}

	@UseGuards(AuthGuard('jwtTwoFactor'))
	@Post('turn-off')
	@HttpCode(200)
	async desactivateTwoFactorAuth(
		@Request() req : any,
		@Res() res : Response,
		){
			const user = req.user;
			await(this.usersService.turnOffTwoFactorAuthentication(user.id));
			const access_token = await this.authService.createJwt({user_id : user.id, oauth_id : user.oauth_id, isTwoFactorAuthEnabled: false}, false)
			const refresh_token = await this.authService.createRefreshToken({user_id : user.id,  account_name :user.account_name, isTwoFactorAuthEnabled: false}, false)
			//   console.log(access_token)
			  res.cookie("access_token", access_token,{maxAge: 1600000, httpOnly: true, sameSite: 'none', secure:true });
			  res.cookie("refresh_token", refresh_token, {maxAge: 86400000, httpOnly: true, sameSite: 'none', secure:true});
			  res.json({username: user.username})
			  res.send();
			  return ;

	}

	@UseGuards(AuthGuard('jwt'))
	@Post('authenticate')
	@HttpCode(200)
	async authenticate(
		@Request() req : any,
		@Res() res : Response,
		@Body() {twoFactorAuthCode} : TwoFactorAuthCodeDto
	){
		const user = req.user;
		const isCodeValid = await this.twoFactorAuthService.isTwoFactorAuthSecretValid(
			twoFactorAuthCode, user.id
		  );
		  if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		  }
		  const access_token = await this.authService.createJwt({user_id : user.id, oauth_id : user.oauth_id, isTwoFactorAuthEnabled: user.isTwoFactorAuthEnabled}, true)
		  const refresh_token = await this.authService.createRefreshToken({user_id : user.id,  account_name :user.account_name, isTwoFactorAuthEnabled: true}, true)
		  res.cookie("access_token", access_token,{maxAge: 1600000, httpOnly: true, sameSite: 'none', secure:true });
		  res.cookie("refresh_token", refresh_token, {maxAge: 86400000, httpOnly: true, sameSite: 'none', secure:true});
		  res.json({username: req.user.username})
		  res.send();
		  return ;
	}

}
