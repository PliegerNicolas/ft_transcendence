import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from './auth.service';
import { ContextCreator } from '@nestjs/core/helpers/context-creator';
import { Request } from 'express';
// import { JwtService } from '@nestjs/jwt';
// import { Auth } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh'){
	constructor(private authService : AuthService) {
		super({
			jwtFromRequest : ExtractJwt.fromHeader("authorization"),
			secretOrKey : process.env.API_SECRET ,
			ignoreExpiration : true,
			passReqToCallback: true
		});
	}

	async validate(req: Request, payload : any) : Promise<any>{
		// console.log('test')
		// console.log((await this.authService.checkUser(payload.oauth_id)).users.id)
		
		// console.log(req.headers)
		if (await this.authService.blacklist("check", req.headers.authorization) == false)
		{
			throw new UnauthorizedException();
		}
		const users = (await this.authService.checkUser(payload.oauth_id)).users
		if (users == null)
		{
			throw new UnauthorizedException();
		}
		if (users.id != payload.user_id)
		{
			throw new UnauthorizedException();
		}
		if (users.isTwoFactorAuthEnabled && !payload.isTwoFactorAuthLogged)
		{
			throw new UnauthorizedException();
		}
		return {id: payload.user_id, oauth_id: payload.oauth_id, username: users.username};
	}
}