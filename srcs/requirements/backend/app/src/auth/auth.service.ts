import {Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Console } from 'console';


@Injectable()
export class AuthService
{
	
	constructor(private jwtService : JwtService) {}


	async signIn(oauthToken : JSON ): Promise<any> {
		const token = Object.values(oauthToken)
		const payload = await fetch("https://api.intra.42.fr/oauth/token", {method : "POST", headers: {
			"Content-Type": "application/json"},
			body:
				JSON.stringify({"grant_type": "authorization_code",
					"client_id": process.env.API_CLIENT_ID,
					"client_secret": process.env.API_SECRET,
					"code": token[0],
					"redirect_uri": token[1]
				})
			}).then(
				(data) => data.json()
			)

			const access = (Object.values(payload)[0]).toString();
			console.log("access");
			console.log(access);
			const info = await fetch("https://api.intra.42.fr/v2/me", {method : "GET", headers: {
			"Authorization" : access},
			}).then(
				(data) => data.json()
			)
			console.log("info");
			console.log(info);
			

		return {
			access_token: await this.jwtService.signAsync(payload),
		};
	}
}
