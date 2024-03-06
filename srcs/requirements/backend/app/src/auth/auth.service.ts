import {Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/profiles/entities/Profile.entity';
import { User } from 'src/users/entities/User.entity';
import { DataSource, Repository } from 'typeorm';


@Injectable()
export class AuthService
{
	constructor(private jwtService : JwtService,
		private dataSource : DataSource,
		@InjectRepository(User)
		private readonly userRepository : Repository<User>) {}

	static _blacklist : string[] = [];

	async blacklist(option : string, token : string) : Promise<boolean> {
		if (option == "add")
		{
			AuthService._blacklist.push(token)
		}
		if (option == "check")
		{
			if (AuthService._blacklist.indexOf(token) != -1)
				return false
		}
		return (true)
	}

	async checkUser(oauthId : string) {


		const users = await this.dataSource
		.getRepository(User)
		.createQueryBuilder()
		.select("user")
		.from(User, "user")
		.where("user.oauthId = :id", { id: BigInt(oauthId) })
		.getOne()
		.then(
			(data) => data
		)

		return {
			users
		};
	}

	async createJwt(payload : any, isTwoFactorAuthLogged : boolean = false){
		payload.isTwoFactorAuthLogged = isTwoFactorAuthLogged;
		await this.jwtService.signAsync(payload)
	}

	async signIn(oauthToken : JSON ): Promise<{access_token : any, isTwoFactorAuthEnabled : any}> {
		const token = Object.values(oauthToken);
		let payload;
		console.log(token)
		let ft_payload = await fetch("https://api.intra.42.fr/oauth/token", {method : "POST", headers: {
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
			// console.log(payload);
			if(Object.keys(ft_payload)[0] != "access_token")
			{
				throw new UnauthorizedException()
			}
			const access = (Object.values(ft_payload)[0]).toString();
			const refresh = (Object.values(ft_payload)[1]).toString();
			const info = await fetch("https://api.intra.42.fr/v2/me", {method : "GET", headers: {
			"Authorization" : "Bearer " + access},
			}).then(
				(data) => data.json()
			)
			// console.log(info)
			const user_id = (await this.checkUser(Object.values(info)[0].toString())).users
			if (user_id === null){
				const users = await this.dataSource
				.createQueryBuilder()
				.insert()
				.into(User)
				.values([
					{"email" : Object.values(info)[1].toString(),
					"oauthId" :BigInt(Object.values(info)[0].toString()),
					"username" : Object.values(info)[2].toString(),
					"image" : Object.values(Object.values(info)[11])[0].toString(),
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
				payload = {user_id :  Object.values(Object.values(users.generatedMaps)[0])[0]}
				this.dataSource.createQueryBuilder()
				.insert()
				.into(Profile)
				.values([
					{
						"firstName" : Object.values(info)[3].toString(),
						"lastName" : Object.values(info)[4].toString(),
						"user" : {
							//id : BigInt(1),
							id : BigInt(payload.user_id),
						}
					}
				])
				.execute()
				// console.log(users)
	
			}
			else{
				payload = { user_id : Object.values(user_id)[0] }
			}
			payload.oauth_id = Object.values(info)[0].toString()
			console.log(JSON.stringify(payload))
			console.log(Object.values(Object.values(info)[11])[0].toString())
			const access_token = await this.createJwt(payload)
			console.log(access_token)
		return {
			access_token,
			isTwoFactorAuthEnabled : payload.isTwoFactorAuthEnabled
		};
	}

	async log_as(username : string) : Promise<any>{

		const member = await this.userRepository.findOne({
			where : {
				username : username
			}
		}).then(
			(data) => data
		)
		if (member == null)
		{
			throw new UnauthorizedException();
		}
		const payload = {user_id : member.id, oauth_id : member.oauthId}
		const access_token = await this.jwtService.signAsync(payload)
		return {
			access_token
		}
	}
}
