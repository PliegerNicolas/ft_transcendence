import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from './auth.service';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh'){
	constructor(private authService : AuthService,
				@InjectRepository(User)
				private readonly userRepository : Repository<User>,
				) {
		var cookieExtractor = function(req) {
			var token = null;
			if (req && req.cookies) {
				token = req.cookies['refresh_token'];
			}
			return token;
		};
		super({
			jwtFromRequest : ExtractJwt.fromExtractors([cookieExtractor]),
			secretOrKey : process.env.API42_SECRET ,
			ignoreExpiration : false,
			passReqToCallback: true
		});
	}

	async checkUser(account_name : string): Promise<User> {
		const user = await this.userRepository.findOne({
			where: { accountname: (account_name) },
			relations: ['profile'],
		});
		return(user);
	}

	async validate(req: Request, payload : any) : Promise<any>{

		if (await this.authService.blacklist("check", req.cookies['refresh_token']) === false) throw new UnauthorizedException();

		const user = await this.checkUser(payload.account_name);
		if (!user) throw new UnauthorizedException();
		if (user.id != payload.user_id)
		{
			throw new UnauthorizedException();
		}
		if (user.isTwoFactorAuthEnabled && !payload.isTwoFactorAuthLogged)
		{
			throw new UnauthorizedException();
		}
		return {id: payload.user_id, oauth_id: payload.oauth_id, username: user.username};
	}
}