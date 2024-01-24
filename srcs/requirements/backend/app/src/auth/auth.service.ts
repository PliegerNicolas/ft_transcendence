import {Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/User';
import { DataSource } from 'typeorm';


@Injectable()
export class AuthService
{
	
	constructor(private jwtService : JwtService, private dataSource : DataSource) {}


	async signIn(oauthToken : JSON ): Promise<any> {
		const token = Object.values(oauthToken)
		let payload = await fetch("https://api.intra.42.fr/oauth/token", {method : "POST", headers: {
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
			"Authorization" : "Bearer " + access},
			}).then(
				(data) => data.json()
			)
			console.log("info");
			console.log(Object.values(info)[0]);
			this.dataSource
			.createQueryBuilder()
			.insert()
			.into(User)
			.values([
				{"email" : Object.values(info)[1].toString(),
				"oauth_id" :Number(Object.values(info)[0].toString()),
				"username" : Object.values(info)[2].toString()
				}
			])
			.execute()

			const users = this.dataSource
			.getRepository(User)
			.createQueryBuilder("user")
			.where("user.oauth_id = :id", { id: info.id })
			.getOne()

			console.log(await users)
			// payload.user_id = (await users).id
			console.log(JSON.stringify(payload))
			const access_token = await this.jwtService.signAsync(payload)
		return {
			access_token,
		};
	}
}
