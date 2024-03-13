import {Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/User.entity';
import { Equal, Repository } from 'typeorm';
import { UsersService } from 'src/modules/users/services/users/users.service';
import { CreateUserDto } from 'src/modules/users/dtos/CreateUser.dto';


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

	async checkUser(oauthId : string | bigint): Promise<User> {
		const user = await this.userRepository.findOne({
			where: { oauthId: Equal(BigInt(oauthId)) },
			relations: ['profile'],
		});

		return (user);
	}

	async createJwt(payload : any, isTwoFactorAuthLogged : boolean = false){
		payload.isTwoFactorAuthLogged = isTwoFactorAuthLogged;
		return (await this.jwtService.signAsync(payload))
	}

	async createRefreshToken(payload : any, isTwoFactorAuthLogged : boolean = false){
		payload.isTwoFactorAuthLogged = isTwoFactorAuthLogged;
		return (await this.jwtService.signAsync(payload,{
			secret : process.env.API_SECRET,
			expiresIn : '1d'
		}))
	}

	async signIn(oauthToken : JSON ): Promise<{access_token : any, refresh_token : any, isTwoFactorAuthEnabled : any}> {
		const [code, redirect_uri] = Object.values(oauthToken);

		let ft_payload = await fetch(
			"https://api.intra.42.fr/oauth/token",
			{
				method : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					"grant_type": "authorization_code",
					"client_id": process.env.API_CLIENT_ID,
					"client_secret": process.env.API_SECRET,
					"code": code,
					"redirect_uri": redirect_uri,
				}),
			}
		).then(
			(data) => data.json()
		);

		if(Object.keys(ft_payload)[0] !== "access_token") throw new UnauthorizedException()
		const access = ft_payload.access_token;

		const info = await fetch(
			"https://api.intra.42.fr/v2/me",
			{
				method : "GET", headers: { "Authorization" : "Bearer " + access },
			}
		).then(
			(data) => data.json()
		);

		let user = await this.checkUser(info.id);
		if (!user) user = await this.userService.createUser(this.transformInfoToCreateUserDto(info));

		const payload = ({ user_id: user.id, oauth_id: user.oauthId, isTwoFactorAuthEnabled: user.isTwoFactorAuthEnabled });
		const access_token = await this.createJwt(payload)
		const refresh_token = await this.createRefreshToken(payload)
		return ({
			access_token,
			refresh_token,
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
		const payload = {user_id : member.id, oauth_id : member.oauthId, isTwoFactorAuthEnabled : true, isTwoFactorAuthLogged: true}
		const access_token = await this.jwtService.signAsync(payload)
		return ({ access_token });
	}

	async refresh_token(jwt : string){
		const payload = this.jwtService.decode(jwt);
		const access_token = (await this.createJwt({user_id : payload.user_id, oauth_id: payload.oauth_id, isTwoFactorEnabled: payload.isTwoFactorAuthEnabled}, payload.isTwoFactorAuthLogged))
		return {access_token : access_token}
	}

	/* Helper Functions */

	private transformInfoToCreateUserDto(info: any): CreateUserDto {
		const createUserDto = new CreateUserDto();

		createUserDto.oauthId = info.id;
		createUserDto.email = info.email;
		createUserDto.username = info.login;
		createUserDto.profile.firstName = info.first_name;
		createUserDto.profile.lastName = info.last_name;

		return (createUserDto);
	}
}
