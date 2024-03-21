import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Equal, Repository } from "typeorm";
import { Message } from "../../entities/Message.entity";
import { Channel } from "src/modules/chats/channels/entities/Channel.entity";
import { User } from "src/modules/users/entities/User.entity";
import { ChannelMembersService } from "src/modules/chats/channels/services/channel-members/channel-members.service";
import { MessagesRightsService } from "../messages-rights/messages-rights.service";
import { CreateMessageParams, ReplaceMessageParams, UpdateMessageParams } from "../../types/message.type";

@Injectable()
export class MessagesService {

    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly channelMemberService: ChannelMembersService,
        private readonly messageRightsService: MessagesRightsService,
    ) {}

    async getChannelMessages(channelId: bigint, username: string = undefined): Promise<Message[]> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId)},
            relations: ['members.user', 'messages.channelMember.user'],
            order: { createdAt: 'ASC' },
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        await this.channelMemberService.canViewChannel(channel, user);

        return (channel.messages);
    }

    async getChannelMessage(channelId: bigint, username: string = undefined, messageId: bigint): Promise<Message> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId)},
            relations: ['members.user', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        await this.channelMemberService.canViewChannel(channel, user);

        const message = channel.messages.find((message) => BigInt(message.id) === messageId);

        if (!message) throw new NotFoundException(`Message with ID ${messageId} not found in Channel with ID ${channelId}`)

        return (message);
    }

    async createChannelMessage(channelId: bigint, username: string = undefined, messageDetails: CreateMessageParams): Promise<Message> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId)},
            relations: ['members.user', 'messages.channelMember.user'],
        })

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        await this.channelMemberService.canWriteInChannel(channel, user);

        const member = this.channelMemberService.getActiveMember(channel, user.id);

        const message = this.messageRepository.create({
            channelId: channel.id,
            channelMember: member,
            ...messageDetails,
        });

        return (await this.messageRepository.save(message));
    }

    async replaceChannelMessage(channelId: bigint, username: string = undefined, messageId: bigint, messageDetails: ReplaceMessageParams): Promise<Message> {
        const message = await this.messageRepository.findOne({
            where: {
                id: Equal(messageId),
                channelId: Equal(channelId),
            },
            relations: ['channel.members.user', 'channelMember.user'],
        })

        if (!message) throw new NotFoundException(`Message with ID ${messageId} not found in Channel with ID ${channelId}`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        await this.messageRightsService.canEdit(message, user);

        this.messageRepository.merge(message, {
            ...messageDetails,
        });

        return (await this.messageRepository.save(message));
    }

    async updateChannelMessage(channelId: bigint, username: string = undefined, messageId: bigint, messageDetails: UpdateMessageParams): Promise<Message> {
        const message = await this.messageRepository.findOne({
            where: {
                id: Equal(messageId),
                channelId: Equal(channelId),
            },
            relations: ['channel.members.user', 'channelMember.user'],
        })

        if (!message) throw new NotFoundException(`Message with ID ${messageId} not found in Channel with ID ${channelId}`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        await this.messageRightsService.canEdit(message, user);

        this.messageRepository.merge(message, {
            ...messageDetails,
        });

        return (await this.messageRepository.save(message));
    }

    async deleteChannelMessage(channelId: bigint, username: string = undefined, messageId: bigint): Promise<string> {
        const message = await this.messageRepository.findOne({
            where: {
                id: Equal(messageId),
                channelId: Equal(channelId),
            },
            relations: ['channel.members.user', 'channelMember.user'],
        })

        if (!message) throw new NotFoundException(`Message with ID ${messageId} not found in Channel with ID ${channelId}`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        await this.messageRightsService.canDelete(message, user);

        await this.messageRepository.remove(message);
        return (`Message with ID ${messageId} of Channel with ID ${channelId} successfully deleted`);
    }

    /* Helper Functions */

    /*public generateNextMessageId(channel: Channel): bigint {
        if (!channel.messages) return (BigInt(1));

        const highestMessageId: bigint = channel.messages.reduce<bigint>((maxId, message) => {
            const messageId = BigInt(message.id);
            return (messageId > maxId ? messageId : maxId);
        }, BigInt(0));

        return (highestMessageId + BigInt(1));
    }*/

}
