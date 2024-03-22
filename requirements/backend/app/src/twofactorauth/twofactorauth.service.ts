import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {toFileStream} from 'qrcode'
import { Response } from 'express';
import { UsersService } from '../modules/users/services/users/users.service';
import { User } from '../modules/users/entities/User.entity';

@Injectable()
export class TwoFactorAuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository : Repository<User>,
		private readonly usersService: UsersService,
	){}

	public async generateTwoFactorAuthSecret(oauth_id : bigint){
		
		const secret = authenticator.generateSecret();

		const user = await this.userRepository.findOne({
			where : {
				oauthId : oauth_id
			}
		})

		const otpauthUrl = authenticator.keyuri(user.email, 'Ft_pong', secret);

		await this.usersService.setTwoFactorAuthSecret(user, secret);

		return {secret, otpauthUrl}

	}

	public async pipeQrCodeSteam(stream : Response, otpauthUrl : string){
		return toFileStream(stream, otpauthUrl);
	}

	public async isTwoFactorAuthSecretValid(twoFactorAuthenticationCode: string, user_id: any)
	{
		const user = await this.userRepository.findOne({
			where : {
				id : user_id
			}
		})
		.then(
			(data) => data
		)
		// console.log(user.twoFactorAuthSecret)
		// console.log(twoFactorAuthenticationCode)
		return authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: user.twoFactorAuthSecret
		  })
	}

}
