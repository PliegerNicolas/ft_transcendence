import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
	constructor(private authService : AuthService) {
		var cookieExtractor = function(req) {
			var token = null;
			if (req && req.cookies) {
				token = req.cookies['access_token'];
			}
			return token;
		};
		super({
			jwtFromRequest : ExtractJwt.fromExtractors([cookieExtractor]),
			secretOrKey : process.env.API42_SECRET ,
			ignoreExpiration : false,
			passReqToCallback: true
		});
	}

	async validate(req: Request, payload : any) : Promise<any>{

		if (await this.authService.blacklist("check", req.cookies['access_token']) === false) throw new UnauthorizedException();

		const user = await this.authService.checkUser(payload.oauth_id);
		if (!user) throw new UnauthorizedException();
		if (user.id != payload.user_id)
		{
			throw new UnauthorizedException();
		}
		return {id: payload.user_id, oauth_id: payload.oauth_id, username: user.username, account_name :user.accountname};
	}
}

