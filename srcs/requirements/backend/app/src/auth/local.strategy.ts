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
			secretOrKey : process.env.API_SECRET
		});
	}

	async sign(oauthToken : string) : Promise<any>{
		console.log("sign")
		const decode = this.jwtService.decode(oauthToken) as JSON;
		console.log(Object.values(decode))
		const token = await this.authService.checkUser(oauthToken);
		if (!token.users)
		{
			throw new UnauthorizedException();
		}
		return token;
	}
}