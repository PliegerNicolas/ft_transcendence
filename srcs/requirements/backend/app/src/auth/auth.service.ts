import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService
{
	
	constructor(private jwtService : JwtService) {}


	async signIn(oauthToken : string): Promise<any> {
		const payload = {sub : oauthToken};

		return {
			accessToken: await this.jwtService.signAsync(payload),
		};
	}
}
