import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService
{
	
	constructor(private jwtService : JwtService) {}


	async signIn(oauthToken : string): Promise<any> {
		// const payload = {sub : oauthToken};

		const payload = fetch ("https://api.intra.42.fr/", {method : "POST", headers: {
			"Content-Type": "application/json"},
			body:
				JSON.stringify({"grant-type": "authorization_code",
					"client_id": process.env.API_CLIENT_ID,
					"client_secret": process.env.API_SECRET,
					"code": oauthToken,
					"redirect_uri": "http://localhost:3030/auth"
				})
			})
		return {
			access_token: await this.jwtService.signAsync(payload),
		};
	}
}
