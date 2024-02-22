import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/services/users/users.service';
import { authenticator } from 'otplib';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/User.entity';
import { Repository } from 'typeorm';

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

}
