import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(Strategy, 'jwtTwoFactor'){
	constructor(private authService : AuthService) {
		super({
			jwtFromRequest : ExtractJwt.fromHeader("authorization"),
			secretOrKey : process.env.API_SECRET ,
			ignoreExpiration : false,
			passReqToCallback: true
		});
	}

	async validate(req: Request, payload : any) : Promise<any>{
		// console.log('test')
		// console.log((await this.authService.checkUser(payload.oauth_id)).users.id)
		
		// console.log(req.headers)
		if (await this.authService.blacklist("check", req.headers.authorization) === false) throw new UnauthorizedException();

		const user = await this.authService.checkUser(payload.oauth_id);
		if (!user) throw new UnauthorizedException();
		if (user.id != payload.user_id)
		{
			throw new UnauthorizedException();
		}
		if (user.isTwoFactorAuthEnabled && !payload.isTwoFactorAuthLogged)
		{
			throw new UnauthorizedException();
		}
		return {id: payload.user_id, oauth_id: payload.oauth_id, username: user.username};
	}
}