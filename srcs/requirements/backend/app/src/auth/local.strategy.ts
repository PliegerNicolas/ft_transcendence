import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {Strategy} from 'passport-42'
import { AuthService } from './auth.service';

@Injectable()
export class Oauth42Strategy extends PassportStrategy(Strategy, '42'){
	constructor(private authService : AuthService) {
		super({
			clientID: process.env.API_CLIENT_ID,
			clientSecret: process.env.API_SECRET,
			callbackURL: "/auth"
		});
	}

	async sign(oauthToken : JSON) : Promise<any>{
		console.log("sign")
		const token = await this.authService.signIn(oauthToken);
		if (!token.access_token)
		{
			throw new UnauthorizedException();
		}
		return token;
	}
}