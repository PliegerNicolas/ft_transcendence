import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { User } from '../../../../modules/users/entities/User.entity';
import { UsersService } from '../../../../modules/users/services/users/users.service';
import { Equal, Repository } from 'typeorm';
import { Response } from 'express';

@Injectable()
export class TwoFactorAuthentificationService {

    constructor(
		@InjectRepository(User)
		private readonly userRepository : Repository<User>,

        private readonly usersService: UsersService,
    ){}

	public async generateTwoFactorAuthSecret(oauthId: bigint){
		const secret = authenticator.generateSecret();

		const user = await this.userRepository.findOne({
			where : { oauthId : Equal(oauthId) }
		});

		const otpauthUrl = authenticator.keyuri(user.email, 'Ft_pong', secret);

		await this.usersService.setTwoFactorAuthSecret(user, secret);

		return ({secret, otpauthUrl});

	}

	public async pipeQrCodeSteam(stream : Response, otpauthUrl : string){
		return (toFileStream(stream, otpauthUrl));
	}

}
