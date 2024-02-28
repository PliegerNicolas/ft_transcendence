import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from './auth.service';
// import { JwtService } from '@nestjs/jwt';
// import { Auth } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
	constructor(private authService : AuthService) {
		super({
			jwtFromRequest : ExtractJwt.fromHeader("authorization"),
			secretOrKey : process.env.API_SECRET ,
			ignoreExpiration : false
		});
	}

	async validate(payload : any) : Promise<any>{
		// console.log('test')
		// console.log((await this.authService.checkUser(payload.oauth_id)).users.id)
		const users = (await this.authService.checkUser(payload.oauth_id)).users
		if (users == null)
		{
			throw new UnauthorizedException();
		}
		if (users.id != payload.user_id)
		{
			throw new UnauthorizedException();
		}
		return {id: payload.user_id, oauth_id: payload.oauth_id, username: users.username};
	}
}