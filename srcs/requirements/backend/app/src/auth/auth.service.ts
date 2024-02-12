import {Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { profile } from 'console';
import { query } from 'express';
import { Profile } from 'src/profiles/entities/Profile.entity';
import { User } from 'src/users/entities/User.entity';
import { DataSource, Entity, InsertQueryBuilder, QueryBuilder, createQueryBuilder } from 'typeorm';


@Injectable()
export class AuthService
{
	
	constructor(private jwtService : JwtService, private dataSource : DataSource) {}

	async checkUser(oauthId : string) {


		const users = await this.dataSource
		.getRepository(User)
		.createQueryBuilder()
		.select("user.id")
		.from(User, "user")
		.where("user.oauthId = :id", { id: Number(oauthId) })
		.getOne()
		.then(
			(data) => data
		)

		return{
			users
		};
	}

	async verify(){

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
			console.log(payload);
			const access = (Object.values(payload)[0]).toString();
			const refresh = (Object.values(payload)[1]).toString();
			const info = await fetch("https://api.intra.42.fr/v2/me", {method : "GET", headers: {
			"Authorization" : "Bearer " + access},
			}).then(
				(data) => data.json()
			)
			const user_id = (await this.checkUser(Object.values(info)[0].toString())).users
			if (user_id === null){
				const users = await this.dataSource
				.createQueryBuilder()
				.insert()
				.into(User)
				.values([
					{"email" : Object.values(info)[1].toString(),
					"oauthId" :Number(Object.values(info)[0].toString()),
					"username" : Object.values(info)[2].toString(),
					"profile" : {
						"firstName" : Object.values(info)[3].toString(),
						"lastName" : Object.values(info)[4].toString(),
						}
					}
				])

				.execute()
				.then(
					(data) => data
				)
				this.dataSource.createQueryBuilder()
				.insert()
				.into(Profile)
				.values([
					{
						"firstName" : Object.values(info)[3].toString(),
						"lastName" : Object.values(info)[4].toString(),
						"user" : {
							id : 1,
						}
					}
				])
				.execute()
				// console.log(users)
				payload.user_id = Object.values(Object.values(users.generatedMaps)[0])[0]
			}
			else{
				payload.user_id = Object.values(user_id)[0]
			}
			console.log(JSON.stringify(payload))
			const access_token = await this.jwtService.signAsync(payload)
		return {
			access_token,
		};
	}
}
