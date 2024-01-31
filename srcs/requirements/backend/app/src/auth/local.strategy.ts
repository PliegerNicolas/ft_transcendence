import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {Strategy} from 'passport-local'
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
	constructor(private authService : AuthService) {
		super();
	}

	async sign(oauthToken:JSON) : Promise<any>{
		console.log("sign")
		const token = await this.authService.signIn(oauthToken);
		// if (!token.access_token)
		// {
		// 	throw new UnauthorizedException();
		// }
		return token;
	}
}