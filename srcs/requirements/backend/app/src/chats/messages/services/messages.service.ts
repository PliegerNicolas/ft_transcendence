import { Injectable, NotFoundException } from '@nestjs/common';
import { Message } from '../entities/Message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from 'src/chats/channels/entities/Channel.entity';
import { User } from 'src/users/entities/User.entity';
import { CreateMessageParams } from '../types/message.type';

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
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['channels.messages.user'],
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        const channel = user.channels.find((channel) => channel.id == channelId);

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found in user's channels`);

        return (channel.messages);
    }

    async getChannelMessage(userId: number, channelId: number, messageId: number): Promise<Message> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['channels.messages.user'],
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        const channel = user.channels.find((channel) => channel.id == channelId);

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found in user's channels`);

        const message = channel.messages.find((message) => message.id == messageId);

        if (!message) throw new NotFoundException(`Message with ID ${messageId} not found in target channel`);

        return (message);
    }

    async createChannelMessage(userId: number, channelId: number, messageDetails: CreateMessageParams): Promise<Message> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['channels', 'messages'],
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        const channel = user.channels.find((channel) => channel.id == channelId);

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found in user's channels`);

        const message = this.messageRepository.create({
            user: user,
            channel: channel,
            ...messageDetails,
        });

        return (await this.messageRepository.save(message));
    }

}
