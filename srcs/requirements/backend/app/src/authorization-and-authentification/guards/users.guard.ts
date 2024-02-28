import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/User.entity';
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
	const token = this.jwtService.decode(request.headers.authorization);
	const params = request.params;

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
