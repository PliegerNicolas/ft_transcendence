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
		const userId: bigint = request.user ? BigInt(request.user.id) : BigInt(request.params?.userId);
		const channelId: bigint = BigInt(request.params?.channelId);

		const channelMember: ChannelMember = await this.channelMemberRepository.findOne({
			where: {
				channel: { id: Equal(channelId) },
				user: { id: Equal(userId) },
			}
		});

		if (channelMember?.muted && channelMember?.isMuteExpired())
		{
			// console.log("=== MuteInterceptor ===")
			// console.log("Expired mute detected");
			channelMember.unmute();
			await this.channelMemberRepository.save(channelMember);
		}

		return (next.handle());
	}
}
