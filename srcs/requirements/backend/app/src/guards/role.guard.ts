import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { GlobalRole, Role } from './role.decorator';
import { ChannelMember } from '../modules/chats/channels/entities/ChannelMember.entity';
import { User } from '../modules/users/entities/User.entity';

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
	const token = this.jwtService.decode(request.cookies['access_token']);
	const params = request.params;
	const roles = this.reflector.get(Role, context.getHandler());

	const member = await this.channelMemberRepository.findOne({
		where: {
			channel: { id: Equal(params.channelId) },
			user: { id: Equal(token.user_id) },
		},
		relations: ['channel', 'user'],
	});

	if (!member) return (false);
	
	if (roles.find((element) => element == String(member.role)) == undefined) return (false);
	
	return (true);
  }

}

@Injectable()
export class RoleGlobalGuard implements CanActivate {

	constructor(
		private jwtService : JwtService,
		@InjectRepository(User)
		private userRepository : Repository<User>,
		private reflector : Reflector
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
  		const request = context.switchToHttp().getRequest();
		const token = this.jwtService.decode(request.cookies['access_token']);
		const roles = this.reflector.get(GlobalRole, context.getHandler());

		const member = await this.userRepository.findOne({
			where : {
				id : Equal(token.user_id),
			},
		});

		if (!member) return (false);
	
		if (roles.find((element) => element == String(member.globalServerPrivileges)) == undefined) return (false);

		return (true);
	}
}