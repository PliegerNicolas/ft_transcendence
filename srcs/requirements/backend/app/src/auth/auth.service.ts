import {Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '../modules/profiles/entities/Profile.entity';
import { User } from '../modules/users/entities/User.entity';
import { Equal, Repository } from 'typeorm';
import { UsersService } from 'src/modules/users/services/users/users.service';
import { CreateUserDto } from 'src/modules/users/dtos/CreateUser.dto';
import { CreateProfileDto } from 'src/modules/profiles/dtos/CreateProfile.dto';


@Injectable()
export class AuthService
{
	constructor(
		@InjectRepository(User)
		private readonly userRepository : Repository<User>,

		private jwtService : JwtService,
		private userService: UsersService,
	) {}

	static _blacklist : string[] = [];

	async blacklist(option : string, token : string) : Promise<boolean> {
		if (option == "add") AuthService._blacklist.push(token);
		if (option == "check" && AuthService._blacklist.indexOf(token) != -1) return (false);
		return (true);
	}

	async checkUser(oauthId : string) {

		const users = await this.userRepository.findOne({
			where: { oauthId: Equal(BigInt(oauthId)) },
			relations: ['profile'],
		});

		return ({ users });
	}

	async createJwt(payload : any, isTwoFactorAuthLogged : boolean = false){
		payload.isTwoFactorAuthLogged = isTwoFactorAuthLogged;
		console.log("payload")
		console.log(payload)
		return (await this.jwtService.signAsync(payload))
	}

	async signIn(oauthToken : JSON ): Promise<{access_token : any, isTwoFactorAuthEnabled : any}> {
		const token = Object.values(oauthToken);
		let payload;

		console.log(token)

		let ft_payload = await fetch(
			"https://api.intra.42.fr/oauth/token",
			{
				method : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					"grant_type": "authorization_code",
					"client_id": process.env.API_CLIENT_ID,
					"client_secret": process.env.API_SECRET,
					"code": token[0],
					"redirect_uri": token[1]
				}),
			}
		).then(
			(data) => data.json()
		);
	
		// console.log(payload);
		if(Object.keys(ft_payload)[0] != "access_token") throw new UnauthorizedException()
		const access = (Object.values(ft_payload)[0]).toString();
		const refresh = (Object.values(ft_payload)[1]).toString();
		const info = await fetch(
			"https://api.intra.42.fr/v2/me",
			{
				method : "GET", headers: { "Authorization" : "Bearer " + access },
			}
		).then(
			(data) => data.json()
		);

		// console.log(info)
		const user = (await this.checkUser(Object.values(info)[0].toString())).users;

		console.log(user);

		if (user === null) {
			const createUserDto = this.transformInfoToCreateUserDto(info);
			const users = await this.userService.createUser(createUserDto);

			payload = { user_id :  users.id, isTwoFactorAuthEnabled: false}
		} else {
			payload = { user_id : Object.values(user)[0], isTwoFactorAuthEnabled : user.isTwoFactorAuthEnabled }
		}
		payload.oauth_id = Object.values(info)[0].toString()
		// console.log(JSON.stringify(payload))
		// console.log(Object.values(Object.values(info)[11])[0].toString())
		const access_token = await this.createJwt(payload)
		// console.log(access_token)

		return ({
			access_token,
			isTwoFactorAuthEnabled : payload.isTwoFactorAuthEnabled
		});
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
		const payload = {user_id : member.id, oauth_id : member.oauthId, isTwoFactorAuthLogged: true}
		const access_token = await this.jwtService.signAsync(payload)
		return ({ access_token });
	}

	/* Helper Functions */

	private transformInfoToCreateUserDto(info: any): CreateUserDto {
		const createUserDto = new CreateUserDto();

		console.log(info);

		createUserDto.oauthId = info.id;
		createUserDto.email = info.email;
		createUserDto.username = info.login;
		createUserDto.profile.firstName = info.first_name;
		createUserDto.profile.lastName = info.last_name;

		return (createUserDto);
	}
}
