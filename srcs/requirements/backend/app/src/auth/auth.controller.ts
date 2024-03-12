import { Controller, HttpCode, HttpStatus, Post, Body, UseGuards, Request, Param, Req, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ParseUsernamePipe } from 'src/common/pipes/parse-username/parse-username.pipe';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService){}
	
	@HttpCode(HttpStatus.OK)
	@Post()
	async signIn(@Body() oauthToken:JSON,
				@Res({passthrough : true}) res : Response
				) {
		console.log("controller")
		const ret = await (this.authService.signIn(oauthToken)).then(
			(data) => data
		);
		console.log(ret)
		// console.log(ret.access_token);
		res.cookie("authorization", ret.access_token,{ httpOnly: true});
		res.json({access_token : ret.access_token, isTwoFactorAuthEnabled: ret.isTwoFactorAuthEnabled});
		res.send();
		return ;
		// return {access_token : ret.access_token, isTwoFactorAuthEnabled: ret.isTwoFactorAuthEnabled};
	  }

	@UseGuards(AuthGuard('jwtTwoFactor'))
	@Post('logout')
	addBlacklist(@Request() req){
		return this.authService.blacklist("add", req.headers.authorization)
	}

	@Post('log_as/:username')
	logAs(@Param('username', ParseUsernamePipe) username: string){
		return this.authService.log_as(username)
	}


	@UseGuards(AuthGuard('jwt-refresh'))
	@Get('refresh')
	refreshToken(@Request() req : any,
				@Res() res : Response){
		const access_token = this.authService.refresh_token(req.headers.authorization);
		res.cookie("access_token", access_token,{ httpOnly: true});
		res.json({access_token : access_token});
		res.send();
		// return (access_token);
	}
}
