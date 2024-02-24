import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { Channel } from 'src/chats/channels/entities/Channel.entity';
import { ChannelMember } from 'src/chats/channels/entities/ChannelMember.entity';
import { User } from 'src/users/entities/User.entity';
import { Repository } from 'typeorm';
import { Role } from './role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private jwtService : JwtService,
				@InjectRepository(ChannelMember)
				private channelMemberRepository : Repository<ChannelMember>,
				private reflector : Reflector) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
  	const request = context.switchToHttp().getRequest();
	const token = this.jwtService.decode(request.headers.authorization);
	const params = request.params;
	const roles = this.reflector.get(Role, context.getHandler());
	// console.log(user.channelId)
	// console.log(token.user_id)

	const member = await this.channelMemberRepository.findOne({
	relations : {
			channel : true,
			user : true
		},
		where : {
			channel : {
				id: params.channelId
			},
			user : {
				id : token.user_id
			}
		}

	}).then(
		(data) => data
	)
	if (member == null)
	{
		return (false);
	}
	// console.log(member.role)
	// console.log(roles);
	if (roles.find((element) => element == member.role) == undefined)
	{
		return false;
	}

	return true;
  }

}
