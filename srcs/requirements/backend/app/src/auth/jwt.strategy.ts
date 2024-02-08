import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt'
// import { AuthService } from './auth.service';
// import { JwtService } from '@nestjs/jwt';
// import { Auth } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
	constructor() {
		super({
			jwtFromRequest : ExtractJwt.fromHeader("authorization"),
			secretOrKey : process.env.API_SECRET ,
			ignoreExpiration : true
		});
	}

	async validate(payload : any) : Promise<any>{
		return {userId: payload.user_id}
	}
}