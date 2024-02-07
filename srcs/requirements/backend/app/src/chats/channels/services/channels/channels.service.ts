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
                { status: ChannelStatus.PUBLIC },
                { members: { id: userId } },
            ],
        });

        // add members and additionnal data directly with the channels list in a new custom object ?

        return (channels);
    }

    async getChannelMembers(userId: number = -1, channelId: number): Promise<User[]> {
        // Verify if user is member of that channel and validated with passport. Should we show the user's list only in certain cases ?

        const channel = await this.channelRepository.findOne({
            where: {
                id: channelId,
            },
            relations: ['members'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        if (!channel.members.find((member) => member.id == userId)) {
            throw new BadRequestException(`You need to be member of channel to see it's members`); // handle this directly in the findOne ?
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
    }

    async joinChannel(userId: number = -1, channelId: number) {
        const targetChannel = await this.channelRepository.findOne({
            where: {
                id: channelId,
                members: {
                    id: Not(userId),
                },
            },
            relations: ['members'],
        });

        if (!targetChannel) throw new NotFoundException(`Channel with ID ${channelId} not found or User with ID ${userId} already member of it`);

        const user = await this.userRepository.findOne({
            where: { id: userId},
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        targetChannel.members.push(user);

        return (await this.channelRepository.save(targetChannel));
    }

    async leaveChannel(userId: number = -1, channelId: number) {
        const targetChannel = await this.channelRepository.findOne({
            where: {
                id: channelId,
            },
            relations: ['members'],
        });

        if (!targetChannel) throw new NotFoundException(`Channel with ID ${channelId} not found or User with ID ${userId} not member of it`);

        if (!targetChannel.members.find((member) => member.id == userId)) {
            throw new BadRequestException(`You need to be member of channel to leave it`); // handle this directly in the findOne ?
        }

        targetChannel.members = targetChannel.members.filter((member) => member.id != userId);

        return (await this.channelRepository.save(targetChannel));
    }

    async deleteChannel(userId: number, channelId: number): Promise<string> {
        // Need maybe to add a creator or moderator to ensure I can delete it ? I'll see that later wasup.

        await this.channelRepository.delete(channelId);
        return (`Channel with ID ${channelId} successfully deleted`);
    }

}
