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
			ignoreExpiration : true
		});
	}

	async validate(payload : any) : Promise<any>{
		console.log('test')
		console.log((await this.authService.checkUser(payload.oauth_id)).users.id)
		if ((await this.authService.checkUser(payload.oauth_id)).users.id != payload.user_id)
		{
			throw new UnauthorizedException();
		}
		return {userId: payload.user_id}
	}
}