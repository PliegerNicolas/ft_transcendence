import { UnauthorizedException, Injectable, NotFoundException } from '@nestjs/common';
import { Message } from '../entities/Message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel, ChannelStatus } from 'src/chats/channels/entities/Channel.entity';
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

    async getChannelMessages(userId: bigint = null, channelId: bigint): Promise<Message[]> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['messages.channelMember.user', 'members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (channel.status !== ChannelStatus.PUBLIC
            && !channel.members.find((member) => BigInt(member.user.id) === userId)) {
            throw new UnauthorizedException(`User with ID ${userId} isn't member of Channel with ID ${channelId}`);
        }

        console.log(channel.messages);
        console.log(userId);
        console.log(channel.members);

        return (channel.messages);
    }

    async getChannelMessage(userId: bigint = null, channelId: bigint, messageId: bigint): Promise<Message> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['messages.channelMember.user', 'members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (channel.status !== ChannelStatus.PUBLIC
            && !channel.members.find((member) => BigInt(member.user.id) === userId)) {
            throw new UnauthorizedException(`User with ID ${userId} isn't member of Channel with ID ${channelId}`);
        }

        const message = channel.messages.find((message) => BigInt(message.id) === messageId);

        if (!message) throw new NotFoundException(`Message with ID ${messageId} not found in Channel with ID ${channelId}`);
        
        return (message);
    }

    async createChannelMessage(userId: bigint = null, channelId: bigint, messageDetails: CreateMessageParams): Promise<Message> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user', 'messages'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`)

        const channelMember = channel.members.find((member) => BigInt(member.user.id) === userId);

        if (!channelMember) throw new NotFoundException(`User with ID ${userId} is not member of channel with ID ${channelId}`);

        const message = this.messageRepository.create({
            id: this.generateNextMessageId(channel),
            channelId: channel.id,
            channelMember,
            ...messageDetails,
        });

        return (await this.messageRepository.save(message));
    }

    async replaceChannelMessage(userId: bigint = null, channelId: bigint, messageId: bigint, messageDetails: ReplaceMessageParams): Promise<Message> {
        const message = await this.messageRepository.findOne({
            where: {
                channel: { id: channelId },
                id: messageId,
            },
            relations: ['channelMember.user'],
        });

        if (!message) throw new NotFoundException(`Message with ID ${messageId} not found in Channel with ID ${channelId}`);
        else if (BigInt(message.channelMember.user.id) !== userId) {
            throw new UnauthorizedException(`User with ID ${userId} isn't author of Message with ID ${messageId} in Channel with ID ${channelId}`);
        }

        return (await this.messageRepository.save({
            ...message,
            ...messageDetails,
        }));
    }

    async updateChannelMessage(userId: bigint = null, channelId: bigint, messageId: bigint, messageDetails: UpdateMessageParams): Promise<Message> {
        const message = await this.messageRepository.findOne({
            where: {
                channel: { id: channelId },
                id: messageId,
            },
            relations: ['channelMember.user'],
        });

        if (!message) throw new NotFoundException(`Message with ID ${messageId} not found in Channel with ID ${channelId}`);
        else if (BigInt(message.channelMember.user.id) !== userId) {
            throw new UnauthorizedException(`User with ID ${userId} isn't author of Message with ID ${messageId} in Channel with ID ${channelId}`);
        }

        return (await this.messageRepository.save({
            ...message,
            ...messageDetails,
        }));
    }

    async deleteChannelMessage(userId: bigint = null, channelId: bigint, messageId: bigint): Promise<string> {
        const message = await this.messageRepository.findOne({
            where: {
                channel: { id: channelId },
                id: messageId,
            },
            relations: ['channelMember.user'],
        });

        if (!message) throw new NotFoundException(`Message with ID ${messageId} not found in Channel with ID ${channelId}`);
        else if (BigInt(message.channelMember.user.id) !== userId) {
            throw new UnauthorizedException(`User with ID ${userId} isn't author of Message with ID ${messageId} in Channel with ID ${channelId}`);
        }

        await this.messageRepository.remove(message);
        return (`Message with ID ${messageId} in Channel with ID ${channelId} successfully deleted`);
    }

    /* Helper Functions */

    public generateNextMessageId(channel: Channel): bigint {
        if (!channel.messages) return (BigInt(1));

        const highestMessageId: bigint = channel.messages.reduce<bigint>((maxId, message) => {
            const messageId = BigInt(message.id);
            return (messageId > maxId ? messageId : maxId);
        }, BigInt(0));

        return (highestMessageId + BigInt(1));
    }

}
