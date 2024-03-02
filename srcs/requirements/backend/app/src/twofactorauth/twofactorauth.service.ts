import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/services/users/users.service';
import { authenticator } from 'otplib';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/User.entity';
import { Repository } from 'typeorm';
import {toFileStream} from 'qrcode'
import { Response } from 'express';

@Injectable()
export class TwoFactorAuthService {
	constructor(private usersService: UsersService,
		@InjectRepository(User)
		private userRepository : Repository<User>){}

	public async generateTwoFactorAuthSecret(oauth_id : bigint){
		
		const secret = authenticator.generateSecret();

		const user = await this.userRepository.findOne({
			where : {
				oauthId : oauth_id
			}
		})

		const otpauthUrl = authenticator.keyuri(user.email, 'Ft_pong', secret);

		await this.usersService.setTwoFactorAuthSecret(Number(user.id), secret);

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
		return authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: user.twoFactorAuthSecret
		  })
	}

}
