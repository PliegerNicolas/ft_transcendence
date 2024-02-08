import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt'
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Auth } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
	constructor(private authService : AuthService, private jwtService : JwtService) {
		super({
			jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey : process.env.API_SECRET,
			ignoreExpiration : true
		});
	}

	async validate(payload : any) : Promise<any>{
		console.log("sign")
		return (payload)
	}
}