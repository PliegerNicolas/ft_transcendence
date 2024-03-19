import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelMember } from '../modules/chats/channels/entities/ChannelMember.entity';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class ChannelsGuard implements CanActivate {

	constructor(private jwtService : JwtService,
		@InjectRepository(ChannelMember)
		private channelMemberRepository : Repository<ChannelMember>,
	) {}

	async canActivate(
		context: ExecutionContext,
	  ): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.jwtService.decode(request.cookies['access_token']);
		const params = request.params;

		const member = await this.channelMemberRepository.findOne({
			where: {
				channel: { id: Equal(params.channelId) },
				user: { id: Equal(token.user_id) },
				active: true,
			},
		});

		if (!member) return (false);
	
		return (true);
	}
}

@Injectable()
export class ChannelsNotGuard implements CanActivate {

	constructor(private jwtService : JwtService,
		@InjectRepository(ChannelMember)
		private channelMemberRepository : Repository<ChannelMember>,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.jwtService.decode(request.cookies['access_token']);
		const params = request.params;

		const member = await this.channelMemberRepository.findOne({
			where : {
				channel : { id: Equal(params.channelId) },
				user : { id: Equal(token.user_id) },
				active: true,
			},
		});

		if (!member) return (true);
	
		return (false);
	}
}