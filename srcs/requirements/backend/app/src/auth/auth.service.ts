import {Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


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
		return {
			access_token: await this.jwtService.signAsync(payload),
		};
	}
}
