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
		res.cookie("access_token", ret.access_token,{maxAge: 1600000, httpOnly: true, sameSite: 'none', secure:true });
		res.cookie("refresh_token", ret.refresh_token, {maxAge: 86400000, httpOnly: true, sameSite: 'none', secure:true})
		res.json({isTwoFactorAuthEnabled: ret.isTwoFactorAuthEnabled});
		res.send();
		return ;
	  }

	@UseGuards(AuthGuard('jwtTwoFactor'))
	@Post('logout')
	addBlacklist(@Request() req){
		return this.authService.blacklist("add", req.headers.authorization)
	}

	@Post('log_as/:username')
	async logAs(@Param('username', ParseUsernamePipe) username: string,
				@Res({passthrough : true}) res : Response){
		const ret = await this.authService.log_as(username)
		res.cookie("access_token", ret.access_token,{maxAge: 1600000, httpOnly: true, sameSite: 'none', secure:true });
		res.cookie("refresh_token", ret.refresh_token, {maxAge: 86400000, httpOnly: true, sameSite: 'none', secure:true})
		res.json({isTwoFactorAuthEnabled: ret.isTwoFactorAuthEnabled});
		res.send();
		return ;
	}


	@UseGuards(AuthGuard('jwt-refresh'))
	@Get('refresh')
	refreshToken(@Request() req : any,
				@Res() res : Response){
		const access_token = this.authService.refresh_token(req.headers.authorization);
		res.cookie("access_token", access_token,{maxAge: 1600000, httpOnly: true, sameSite: 'none', secure:true });
		res.send();
	}
}
