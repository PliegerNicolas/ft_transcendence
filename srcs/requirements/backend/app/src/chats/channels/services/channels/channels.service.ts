import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, ChannelStatus } from '../../entities/Channel.entity';
import { Repository } from 'typeorm';
import { CreateChannelParams, ReplaceChannelParams, UpdateChannelParams } from '../../types/channel.type';
import { User } from 'src/users/entities/User.entity';
import { ChannelMember, ChannelRole } from '../../entities/ChannelMember.entity';

@Injectable()
export class ChannelsService {

    constructor(
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getChannels(userId: bigint = null): Promise<Channel[]> {
       return (await this.channelRepository.find({
            where: [
                { members: { user: { id: userId } } },
                { status: ChannelStatus.PUBLIC },
            ],
        }));
    }

    async getChannel(userId: bigint = null, channelId: bigint): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: {
                id: channelId,
            },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.some((member) => member.user.id == userId)) {
            throw new UnauthorizedException(`User with ID ${userId} isn't member of channel with ID ${channelId}`);
        }

        return (channel);
    }

    async getChannelMembers(userId: bigint = null, channelId: bigint): Promise<ChannelMember[]> {
        const channel = await this.channelRepository.findOne({
            where: {
                id: channelId,
            },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.some((member) => member.user.id == userId)) {
            throw new UnauthorizedException(`User with ID ${userId} isn't member of channel with ID ${channelId}`);
        }

        return (channel.members);
    }

    async createChannel(userId: bigint = null, channelDetails: CreateChannelParams): Promise<Channel> {
        if (!userId) throw new UnauthorizedException('You should be logged in to create a Channel'); // Temp ?

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if  (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        const channel = this.channelRepository.create({
            ...channelDetails,
            members: [{ user, role: ChannelRole.ADMIN }],
        });

        return (await this.channelRepository.save(channel))
    }

    async replaceChannel(userId: bigint = null, channelId: bigint, channelDetails: ReplaceChannelParams): Promise<Channel> {
        if (!userId) throw new UnauthorizedException('You should be logged in to replace a Channel'); // Temp ?

        const  channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        })

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.some((member) => member.user.id == userId)) {
            throw new UnauthorizedException(`User with ID ${userId} isn't member of Channel with ID ${channelId}`);
        }

        return (await this.channelRepository.save({
            ...channel,
            ...channelDetails,
        }));
    }

    async updateChannel(userId: bigint = null, channelId: bigint, channelDetails: UpdateChannelParams): Promise<Channel> {
        if (!userId) throw new UnauthorizedException('You should be logged in to update a Channel'); // Temp ?

        const  channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        })

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.some((member) => member.user.id == userId)) {
            throw new UnauthorizedException(`User with ID ${userId} isn't member of Channel with ID ${channelId}`);
        }

        return (await this.channelRepository.save({
            ...channel,
            ...channelDetails,
        }));
    }

    async joinChannel(userId: bigint = null, channelId: bigint) {
        if (!userId) throw new UnauthorizedException('You should be logged in to join a Channel'); // Temp ?

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (channel.members.some((member) => member.user.id == userId)) {
            throw new UnauthorizedException(`User with ID ${userId} is already member of channel with ID ${channelId}`);
        }

        return (await this.channelRepository.save({
            ...channel,
            membersCount: ++channel.membersCount,
            members: [...channel.members, {user, role: ChannelRole.MEMBER }],
        }));
    }

    async leaveChannel(userId: bigint = null, channelId: bigint) {
        if (!userId) throw new UnauthorizedException('You should be logged in to join a Channel'); // Temp ?

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.some((member) => member.user.id == userId)) {
            throw new UnauthorizedException(`User with ID ${userId} is not member of channel with ID ${channelId}`);
        }

        return (await this.channelRepository.save({
            ...channel,
            membersCount: --channel.membersCount,
            members: channel.members.filter(member => member.user.id != userId),
        }));
    }

    async deleteChannel(userId: bigint = null, channelId: bigint): Promise<string> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = channel.members.find((member) => member.user.id == userId)

        if (!user) throw new UnauthorizedException(`User with ID ${userId} isn't member of channel with ID ${channelId}`);
        else if (user.role !== ChannelRole.ADMIN) throw new UnauthorizedException(`User with ID ${userId} hasn't got enough permissions to delete Channel with ID ${channelId}`);

        await this.channelRepository.remove(channel);
        return (`Channel with ID ${channelId} successfully deleted`);
    }

}
