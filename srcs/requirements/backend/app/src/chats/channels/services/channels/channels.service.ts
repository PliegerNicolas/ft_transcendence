import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, ChannelStatus } from '../../entities/Channel.entity';
import { Not, Repository } from 'typeorm';
import { CreateChannelParams, ReplaceChannelParams, UpdateChannelParams } from '../../types/channel.type';
import { User } from 'src/users/entities/User.entity';

@Injectable()
export class ChannelsService {

    constructor(
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getChannels(userId: number = -1): Promise<Channel[]> {
        // Add filter with passport id. It should get all public channels

        const channels = await this.channelRepository.find({
            where: [
                { members: { id: userId } },
                { status: ChannelStatus.PUBLIC },
            ],
        });

        // add members and additionnal data directly with the channels list in a new custom object ?

        return (channels);
    }

    async getChannelMembers(userId: number = -1, channelId: number): Promise<User[]> {
        // Verify if user is member of that channel and validated with passport. Should we show the user's list only in certain cases ?

        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found.`);
        else if (!channel.members.some((member) => member.id == userId)) {
            throw new BadRequestException(`User with ID ${userId} isn't member of channel with ID ${channelId}`);
        }

        return (channel.members);
    }

    async createChannel(userId: number = -1, channelDetails: CreateChannelParams): Promise<Channel> {
        if (!userId) throw new BadRequestException('You should be logged in to create a Channel');

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        const channel = this.channelRepository.create({
            members: [user],
            ...channelDetails,
        });

        return (await this.channelRepository.save(channel));
    }

    async replaceChannel(userId: number = -1, channelId: number, channelDetails: ReplaceChannelParams): Promise<Channel> {
        // I should find a way to ensure the given userId is creator or moderator.
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        return (await this.channelRepository.save({
            ...channelDetails,
            ...channel,
        }));

        // check user count here ?
    }

    async updateChannel(userId: number = -1, channelId: number, channelDetails: UpdateChannelParams): Promise<Channel> {
        // I should find a way to ensure the given userId is creator or moderator.
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        return (await this.channelRepository.save({
            ...channelDetails,
            ...channel,
        }));

        // check user count here ?
    }

    async joinChannel(userId: number = -1, channelId: number) {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { id: userId },
        })
    
        if (channel.members.some((member) => member.id == userId)) {
            throw new BadRequestException(`User with ID ${userId} is already member of channel with ID ${channelId}`);
        }

        channel.members.push(user);
        channel.updateMembersCount();

        return (await this.channelRepository.save(channel));
    }

    async leaveChannel(userId: number = -1, channelId: number) {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        if (!channel.members.some((member) => member.id == userId)) {
            throw new BadRequestException(`User with ID ${userId} is not member of channel with ID ${channelId}`);
        }

        channel.members = channel.members.filter((member) => member.id != userId);
        channel.updateMembersCount();

        return (await this.channelRepository.save(channel));
    }

    async deleteChannel(userId: number, channelId: number): Promise<string> {
        // Need maybe to add a creator or moderator to ensure I can delete it ? I'll see that later wasup.

        await this.channelRepository.delete(channelId);
        return (`Channel with ID ${channelId} successfully deleted`);
    }

}
