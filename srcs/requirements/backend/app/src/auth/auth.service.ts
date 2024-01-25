import {Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/User';
import { DataSource } from 'typeorm';


@Injectable()
export class AuthService
{
	
	constructor(private jwtService : JwtService, private dataSource : DataSource) {}

	async checkUser(oauth_id : string) {


		const users = await this.dataSource
		.getRepository(User)
		.createQueryBuilder()
		.select("user.id")
		.from(User, "user")
		.where("user.oauth_id = :id", { id: Number(oauth_id) })
		.getOne()
		.then(
			(data) => data
		)

		return{
			users
		};
	}

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
			const info = await fetch("https://api.intra.42.fr/v2/me", {method : "GET", headers: {
			"Authorization" : "Bearer " + access},
			}).then(
				(data) => data.json()
			)
			if ((await this.checkUser(Object.values(info)[0].toString())).users === null){
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
			}
			payload.user_id = info.id
			console.log(JSON.stringify(payload))
			const access_token = await this.jwtService.signAsync(payload)
		return {
			access_token,
		};
	}
}
