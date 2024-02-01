import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from '../../entities/Channel.entity';
import { Repository } from 'typeorm';
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

    async getChannels(): Promise<Channel[]> {
        return (await this.channelRepository.find());
    }

    async getUserChannels(userId: number): Promise<Channel[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['channels'],
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        return (user.channels);
    }

    async createChannel(userId: number, channelDetails: CreateChannelParams): Promise<Channel> {
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

    async replaceChannel(id: number, channelDetails: ReplaceChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id },
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${id} not found`);

        return (await this.channelRepository.save({
            ...channelDetails,
            ...channel,
        }));
    }

    async updateChannel(id: number, channelDetails: UpdateChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id },
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${id} not found`);

        return (await this.channelRepository.save({
            ...channelDetails,
            ...channel,
        }));
    }

    async joinChannel(userId: number, channelId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId},
            relations: ['channels'],
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        const targetChannel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members'],
        });

        if (!targetChannel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        if (user.channels.find((channel) => channel.id == targetChannel.id)) {
            throw new BadRequestException(`User with ID ${userId} already in channel with ID ${channelId}`);
        }

        targetChannel.members.push(user);

        return (await this.channelRepository.save(targetChannel));

    }

    async leaveChannel(userId: number, channelId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId},
            relations: ['channels'],
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        const targetChannel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members'],
        });

        if (!targetChannel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const memberIndex = targetChannel.members.findIndex((member) => member.id == user.id);

        if (memberIndex == -1) throw new BadRequestException(`User with ID ${userId} not in channel with ID ${channelId}`);

        targetChannel.members.splice(memberIndex, 1);

        return (await this.channelRepository.save(targetChannel));

    }

    async deleteChannel(id: number): Promise<string> {
        await this.channelRepository.delete(id);
        return (`Channel with ID ${id} successfully deleted`);
    }

}
