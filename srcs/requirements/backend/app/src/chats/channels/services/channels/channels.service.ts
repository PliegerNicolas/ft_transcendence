import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

    async getChannels(userId: number = -1): Promise<Channel[]> {
        return await this.channelRepository.find({
            where: [
                { members: { id: userId } },
                { status: ChannelStatus.PUBLIC },
            ],
        });
    }

    async getChannelMembers(userId: number = -1, channelId: number): Promise<ChannelMember[]> {
        const channel = await this.channelRepository.findOne({
            where: {
                id: channelId,
            },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.some((member) => member.user.id == userId)) {
            throw new BadRequestException(`User with ID ${userId} isn't member of channel with ID ${channelId}`);
        }

        return (channel.members);
    }

    async createChannel(userId: number, channelDetails: CreateChannelParams): Promise<Channel> {
        if (!userId) throw new BadRequestException('You should be logged in to create a Channel'); // Temp ?

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

    async replaceChannel(userId: number, channelId: number, channelDetails: ReplaceChannelParams): Promise<Channel> {
        if (!userId) throw new BadRequestException('You should be logged in to replace a Channel'); // Temp ?

        const  channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        })

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.some((member) => member.id == userId)) {
            throw new BadRequestException(`User with ID ${userId} isn't member of Channel with ID ${channelId}`);
        }

        return (await this.channelRepository.save({
            ...channel,
            ...channelDetails,
        }));
    }

    async updateChannel(userId: number, channelId: number, channelDetails: UpdateChannelParams): Promise<Channel> {
        if (!userId) throw new BadRequestException('You should be logged in to update a Channel'); // Temp ?

        const  channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        })

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.some((member) => member.id == userId)) {
            throw new BadRequestException(`User with ID ${userId} isn't member of Channel with ID ${channelId}`);
        }

        return (await this.channelRepository.save({
            ...channel,
            ...channelDetails,
        }));
    }

    async joinChannel(userId: number = -1, channelId: number) {
        if (!userId) throw new BadRequestException('You should be logged in to join a Channel'); // Temp ?

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
            throw new BadRequestException(`User with ID ${userId} is already member of channel with ID ${channelId}`);
        }

        return (await this.channelRepository.save({
            ...channel,
            membersCount: ++channel.membersCount,
            members: [...channel.members, {user, role: ChannelRole.MEMBER }],
        }));
    }

    async leaveChannel(userId: number = -1, channelId: number) {
        if (!userId) throw new BadRequestException('You should be logged in to join a Channel'); // Temp ?

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
            throw new BadRequestException(`User with ID ${userId} is not member of channel with ID ${channelId}`);
        }

        return (await this.channelRepository.save({
            ...channel,
            membersCount: --channel.membersCount,
            members: channel.members.filter(member => member.user.id != userId),
        }));
    }

    async deleteChannel(userId: number, channelId: number): Promise<string> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = channel.members.find((member) => member.user.id == userId)

        if (!user) throw new BadRequestException(`User with ID ${userId} isn't member of channel with ID ${channelId}`);
        else if (user.role !== ChannelRole.ADMIN) throw new BadRequestException(`User with ID ${userId} hasn't got enough permissions to delete Channel with ID ${channelId}`);

        await this.channelRepository.delete(channelId);
        return (`Channel with ID ${channelId} successfully deleted`);
    }

}
