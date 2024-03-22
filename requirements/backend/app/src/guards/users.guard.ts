import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersGuard implements CanActivate {
	constructor(private jwtService : JwtService,
		@InjectRepository(User)
		private userRepository : Repository<User>,
		// private reflector : Reflector
		) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
	const request = context.switchToHttp().getRequest();
	const token = this.jwtService.decode(request.request.cookie['access_token']);
	const params = request.params;
	
	const usercheck = await this.userRepository.findOne({
		where : {
			username : params.username
		}
	})
	if (usercheck == null)
	{
		throw new NotFoundException();
	}

	const user = await this.userRepository.findOne({
		where : {
			id : token.user_id
		}
	})
	if (user == null)
	{
		return false;
	}
	if (params.username != user.username)
	{
		return false;
	}

    return true;
  }
}
