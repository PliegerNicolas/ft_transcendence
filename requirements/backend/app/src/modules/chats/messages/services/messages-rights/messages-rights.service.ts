import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../../entities/Message.entity';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/User.entity';
import { ChannelMembersService } from 'src/modules/chats/channels/services/channel-members/channel-members.service';
import { ChannelRole, compareChannelRoles } from 'src/modules/chats/channels/enums/channel-role.enum';

@Injectable()
export class MessagesRightsService {

    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,

        private readonly channelMemberService: ChannelMembersService,
    ) {}

    public isMessageOwner(message: Message, user: User): boolean {
        if (!message || !user) return (false);
        return (message.channelMember.user.id === user.id);
    }

    async canEdit(message: Message, user: User): Promise<void> {
        if (!this.channelMemberService.isActiveMember(message.channel, user.id)) throw new UnauthorizedException(`User '${user.username}' isn't member of Channel with ID ${message.channel.id}`);
        if (user.hasGlobalServerPrivileges()) return ;
        if (message.channelMember.user.id !== user.id) throw new UnauthorizedException(`User '${user.username}' isn't owner of Message with ID ${message.id} of Channel with ID ${message.channel.id}`);
    }

    async canDelete(message: Message, user: User): Promise<void> {
        const member = this.channelMemberService.getActiveMember(message.channel, user.id);
        if (!member) throw new UnauthorizedException(`User '${user.username}' isn't member of Channel with ID ${message.channel.id}`);

        if (user.hasGlobalServerPrivileges() || compareChannelRoles(member.role, ChannelRole.OPERATOR) >= 0) return ;
        if (message.channelMember.user.id !== user.id) throw new UnauthorizedException(`User '${user.username}' isn't owner of Message with ID ${message.id} of Channel with ID ${message.channel.id}`);
    }

}
