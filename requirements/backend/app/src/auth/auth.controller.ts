import { Controller, HttpCode, HttpStatus, Post, Body, UseGuards, Request, Param, Req, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ParseUsernamePipe } from 'src/common/pipes/parse-username/parse-username.pipe';
import { Response } from 'express';
import { RoleGlobalGuard } from 'src/guards/role.guard';
import { GlobalRole } from 'src/guards/role.decorator';
import {AuthDto } from './dtos/auth.dtos';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService){}
	
	@HttpCode(HttpStatus.OK)
	@Post()
	async signIn(@Body() {code, redirect_uri}:AuthDto,
				@Res({passthrough : true}) res : Response
				) {
		// console.log("controller")
		const ret = await (this.authService.signIn(code, redirect_uri)).then(
			(data) => data
		);
		res.cookie("access_token", ret.access_token,{maxAge: 1600000, httpOnly: true, sameSite: 'none', secure:true });
		res.cookie("refresh_token", ret.refresh_token, {maxAge: 86400000, httpOnly: true, sameSite: 'none', secure:true})
		res.json({isTwoFactorAuthEnabled: ret.isTwoFactorAuthEnabled});
		res.send();
		return ;
	  }

	// @UseGuards(AuthGuard('jwtTwoFactor'))
	@Post('logout')
	addBlacklist(@Request() req,
	@Res({passthrough : true}) res : Response){
		
		if (req.cookies['refresh_token'])
			this.authService.blacklist("add", req.cookies['refresh_token'])
		if (req.cookies['access_token'])
			this.authService.blacklist("add", req.cookies['access_token'])
		res.cookie("access_token", "",{maxAge: 1, httpOnly: true, sameSite: 'none', secure:true });
		res.cookie("refresh_token", "",{maxAge: 1, httpOnly: true, sameSite: 'none', secure:true })
		return {username : req.username}
	}

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), RoleGlobalGuard)
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
	async refreshToken(@Request() req : any,
				@Res() res : Response){
		const access_token = (await this.authService.refresh_token(req.cookies['refresh_token'])).access_token;
		res.cookie("access_token", access_token,{maxAge: 1600000, httpOnly: true, sameSite: 'none', secure:true });
		res.send();
	}
}
