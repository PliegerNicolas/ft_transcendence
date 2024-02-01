import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Message } from '../entities/Message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from 'src/chats/channels/entities/Channel.entity';
import { User } from 'src/users/entities/User.entity';
import { CreateMessageParams, ReplaceMessageParams, UpdateMessageParams } from '../types/message.type';

@Injectable()
export class MessagesService {

    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getChannelMessages(userId: number, channelId: number): Promise<Message[]> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members', 'messages'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.find((member) => member.id == userId)) {
            throw new NotFoundException(`User with ID ${userId} not member of channel with ID ${channelId}`);
        }

        return (channel.messages);
    }

    async getChannelMessage(userId: number, channelId: number, messageId: number): Promise<Message> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members', 'messages'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        if (!channel.members.find((member) => member.id == userId)) {
            throw new NotFoundException(`User with ID ${userId} not member of channel with ID ${channelId}`);
        }

        const message = channel.messages.find((message) => message.id == messageId);

        if (!message) throw new NotFoundException(`Message with ID ${messageId} not found in channel with ID ${channelId}`);

        return (message);
    }

    async createChannelMessage(userId: number, channelId: number, messageDetails: CreateMessageParams): Promise<Message> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members', 'messages'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = channel.members.find((member) => member.id == userId);

        if (!user) throw new NotFoundException(`User with ID ${userId} is not member of channel with ID ${channelId}`);

        const message = this.messageRepository.create({
            user: user,
            channel: channel,
            ...messageDetails,
        });

        return (await this.messageRepository.save(message));
    }

    async replaceChannelMessage(userId: number, channelId: number, messageId: number, messageDetails: ReplaceMessageParams): Promise<Message> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['messages.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const message = channel.messages.find((message) => message.id == messageId);

        if (!message) throw new NotFoundException(`Message with ID ${messageId} not found in channel with ID ${channelId}`);
    
        if (message.user.id != userId) {
            throw new BadRequestException(`User with ID ${userId} isn't author of message with ID ${messageId} in channel with ID ${channelId}`);
        }

        return (await this.messageRepository.save({
            ...message,
            ...messageDetails,
        }));

    }

    async updateChannelMessage(userId: number, channelId: number, messageId: number, messageDetails: UpdateMessageParams): Promise<Message> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['messages.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const message = channel.messages.find((message) => message.id == messageId);

        if (!message) throw new NotFoundException(`Message with ID ${messageId} not found in channel with ID ${channelId}`);

        if (message.user.id != userId) {
            throw new BadRequestException(`User with ID ${userId} isn't author of message with ID ${messageId} in channel with ID ${channelId}`);
        }

        return (await this.messageRepository.save({
            ...message,
            ...messageDetails,
        }));

    }

    async deleteChannelMessage(userId: number, channelId: number, messageId: number): Promise<string> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['messages'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const message = channel.messages.find((message) => message.id == messageId);

        if (!message) throw new NotFoundException(`Message with ID ${messageId} not found in Channel with ID ${channelId}`);
        else if (message.id != userId) throw new BadRequestException(`User with ID ${userId} isn't author of message with ID ${messageId} in channel with ID ${channelId}`);

        await this.userRepository.delete(messageId);
        return (`Message with ID ${messageId} successfully deleted`);
    }

}
