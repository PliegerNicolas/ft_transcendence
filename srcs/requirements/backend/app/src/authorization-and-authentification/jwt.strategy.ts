import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthentificationService } from './authentification/services/authentification/authentification.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

	constructor(private authentificationService : AuthentificationService) {
		super({
			jwtFromRequest : ExtractJwt.fromHeader("authorization"),
			secretOrKey : process.env.API_SECRET ,
			ignoreExpiration : false
		});
	}

	async validate(payload : any) : Promise<any>{
		// console.log('test')
		// console.log((await this.authService.checkUser(payload.oauth_id)).users.id)
		const user = (await this.authentificationService.checkUser(payload.oauth_id)).user
		if (!user) throw new UnauthorizedException();
		if (user.id !== BigInt(payload.user_id)) throw new UnauthorizedException();
		return ({ id: user.id, oauth_id: user.oauthId, username: user.username });
	}

}