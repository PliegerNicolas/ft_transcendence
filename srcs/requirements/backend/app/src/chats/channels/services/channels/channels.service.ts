import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from '../../entities/Channel.entity';
import { Repository } from 'typeorm';
import { CreateChannelParams } from '../../types/channel.type';
import { ChannelMember } from '../../entities/ChannelMember.entity';
import { User } from 'src/users/entities/User.entity';

@Injectable()
export class ChannelsService {

    constructor(
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
        @InjectRepository(ChannelMember)
        private readonly channelMemberRepository: Repository<ChannelMember>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getChannels(): Promise<Channel[]> {
        return (await this.channelRepository.find());
    }

    async getUserChannels(userId: number): Promise<Channel[]> {
        return null;
        /*
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['channels'],
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        return (user.channels);
        */
    }

    async createChannel(userId: number, channelDetails: CreateChannelParams): Promise<Channel> {
        return null;
        /*
        const channel = this.channelRepository.create({
            users: await this.initializeChannelMembers(userId),
            ...channelDetails,
        });

        return (await this.channelRepository.save(channel));
        */
    }

    /* Helper Functions */

    /*
    private async initializeChannelMembers(userId: number): Promise<ChannelMember[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['channels']
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        const members = [this.channelMemberRepository.create({ user: user })];

        return (members);
    }
    */

}
