import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { ChannelMember } from 'src/modules/chats/channels/entities/ChannelMember.entity';
import { ChannelMembersService } from 'src/modules/chats/channels/services/channel-members/channel-members.service';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class MuteInterceptor implements NestInterceptor {

	constructor(
        @InjectRepository(ChannelMember)
        private readonly channelMemberRepository: Repository<ChannelMember>,
	) {}

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const request = context.switchToHttp().getRequest();

		let userId: bigint = null;
		if (request.user) BigInt(request.user.id);
		else if (request.params?.userId) userId = request.params.userId;
		const channelId: bigint = request.params?.channelId ? BigInt(request.params.channelId) : null;

		if (!channelId || !userId) return (next.handle());

		const channelMember: ChannelMember = await this.channelMemberRepository.findOne({
			where: {
				channel: { id: Equal(channelId) },
				user: { id: Equal(userId) },
			}
		});

		if (channelMember?.muted && channelMember?.isMuteExpired())
		{
			channelMember.unmute();
			await this.channelMemberRepository.save(channelMember);
		}

		return (next.handle());
	}
}
