// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import {Strategy} from 'passport-local'
// import { AuthService } from './auth.service';
// import { JwtModule, JwtService} from '@nestjs/jwt';
// import { jwtConstants } from './constant';

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy){
// 	constructor(private authService : AuthService, private jwtService : JwtService) {
// 		super();
// 	}

// 	async sign(oauthToken:JSON) : Promise<any>{
// 		const token = Object.values(this.jwtService.decode(await this.authService.signIn(oauthToken)));
// 		const info = fetch("https://api.intra.42.fr/v2/me", {method : "GET", headers: {
// 			"Content-Type": "application/json"},
// 			body:
// 				JSON.stringify({
// 					"Authorization": token[0]
// 				})
// 			}).then(
// 				(data) => data.json()
// 			)
// 	}
// }