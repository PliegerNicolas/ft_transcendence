import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

    async getChannelMessages(userId: bigint, channelId: bigint): Promise<Message[]> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['messages', 'members.user'],
        });

        console.log(typeof(channel.members[0].user.id));
        console.log(typeof(userId));
        
        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.find((member) => member.user.id == userId)) {
            throw new ForbiddenException(`User with ID ${userId} isn't member of Channel with ID ${channelId}`);
        }

        return (channel.messages);
    }

    async getChannelMessage(userId: bigint, channelId: bigint, messageId: bigint): Promise<Message> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['messages', 'members.user'],
        });

        console.log(typeof(userId));
        console.log(typeof(channel.members[0].user.id));

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.find((member) => member.user.id === userId)) {
            throw new ForbiddenException(`User with ID ${userId} isn't member of Channel with ID ${channelId}`);
        }

        const message = channel.messages.find((message) => message.id === messageId);

        if (!message) throw new NotFoundException(`Message with ID ${messageId} not found in Channel with ID ${channelId}`);
        
        return (message);
    }

    async createChannelMessage(userId: bigint, channelId: bigint, messageDetails: CreateMessageParams): Promise<Message> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`)

        const channelMember = channel.members.find((member) => member.user.id === userId);

        if (!channelMember) throw new NotFoundException(`User with ID ${userId} is not member of channel with ID ${channelId}`);

        const message = this.messageRepository.create({
            id: this.generateNextMessageId(channel),
            channelId: channel.id,
            channelMember,
            ...messageDetails,
        });

        return (await this.messageRepository.save(message));
    }

    async replaceChannelMessage(userId: bigint, channelId: bigint, messageId: bigint, messageDetails: ReplaceMessageParams): Promise<Message> {
        return (null);
    }

    async updateChannelMessage(userId: bigint, channelId: bigint, messageId: bigint, messageDetails: UpdateMessageParams): Promise<Message> {
        return (null);
    }

    async deleteChannelMessage(userId: bigint, channelId: bigint, messageId: bigint): Promise<string> {
        return (null);
    }

    /* Helper Functions */

    public generateNextMessageId(channel: Channel): bigint {
        const highestMessageId = channel.messages.reduce<bigint>((maxId, message) => {
            const messageId = BigInt(message.id);
            return (messageId > maxId ? messageId : maxId);
        }, BigInt(0));
        
        return (highestMessageId + BigInt(0)); 
    }

}
