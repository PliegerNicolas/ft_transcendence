import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelMember } from '../../entities/ChannelMember.entity';
import { Not, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ChannelCronService {

    constructor(
        @InjectRepository(ChannelMember)
        private readonly channelMemberRepository: Repository<ChannelMember>
    ) {}

    @Cron('*/15 * * * * *') // Every 8 seconds
    async unmuteCronJob(): Promise<void> {
        //console.log("=== cron ===")

        const channelMembers = await this.channelMemberRepository.find({
            where: {
                muted: true,
                mutedSince: Not(null),
            },
        });

        for (const channelMember of channelMembers) {
            if (channelMember.isMuteExpired()) channelMember.unmute();
        }

        await this.channelMemberRepository.save(channelMembers);
        // Trigger socket ?
    }

}