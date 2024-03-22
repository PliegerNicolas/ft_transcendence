import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { IdPipe } from 'src/common/pipes/id/id.pipe';
import { ChannelMember } from 'src/modules/chats/channels/entities/ChannelMember.entity';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class MuteInterceptor implements NestInterceptor {

	constructor(
        @InjectRepository(ChannelMember)
        private readonly channelMemberRepository: Repository<ChannelMember>,

		private readonly idPipe: IdPipe,
	) {}

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const request = context.switchToHttp().getRequest();

		let userId: bigint;
		let channelId: bigint;

		if (request.user) userId = this.idPipe.transform(request.user.id);
		else if (request.params) userId = this.idPipe.transform(request.params.userId);
		if (request.params.channelId) channelId = this.idPipe.transform(request.params.channelId);

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
