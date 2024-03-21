import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "../../entities/Channel.entity";
import { Equal, In, Repository } from "typeorm";
import { User } from "../../../../users/entities/User.entity";
import { UsersService } from "src/modules/users/services/users/users.service";
import { ChannelAccessParams, ChannelWithSpecs, CreateChannelParams, CreatePrivateChannelParams, GetChannelParams, GetChannelsQueryParam, JoinChannelParams, LeaveChannelParams, ReplaceChannelParams, UpdateChannelParams } from "../../types/channel.type";
import { ChannelVisibility } from "../../enums/channel-visibility.enum";
import { ChannelRole } from "../../enums/channel-role.enum";
import { ChannelAccessAction } from "../../enums/channel-access-action.enum";
import { PasswordHashingService } from "../../../../password-hashing/services/password-hashing/password-hashing.service";
import { ChannelMembersService } from "../channel-members/channel-members.service";
import { ChannelMember } from "../../entities/ChannelMember.entity";
import { ChannelMode } from "../../enums/channel-mode.enum";
import { RelationshipStatus } from "src/modules/relationships/enums/relationship-status.enum";

@Injectable()
export class ChannelsService {

    constructor(
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly channelMemberService: ChannelMembersService,
        private readonly userService: UsersService,
        private readonly passwordHashingService: PasswordHashingService,
    ) {}

    async getChannels(username: string = undefined, queryParams: GetChannelsQueryParam): Promise<ChannelWithSpecs[]> {
        const channels = await this.channelRepository.find({
            where: [
                queryParams.name ? { name: Equal(queryParams.name) } : {},
                queryParams.visibility ? { visibility: Equal(queryParams.visibility) } : { visibility: Equal(ChannelVisibility.PUBLIC) },
                queryParams.mode ? { mode: Equal(queryParams.mode) } : {},
                { members: { user: { username: Equal(username) }, active: true } },
                { members: { user: { username: Equal(username) }, invited: true } },
            ],
            relations: ['members.user']
        });

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        return (channels.map((channel) => {
            const member = user ? channel.members?.find((member) => member.user.id === user.id) : null;
            delete channel.activeMembers;
            delete channel.inactiveMembers;
            delete channel.invitedMembers;
            delete channel.mutedMembers;
            delete channel.bannedMembers; // Holy fuck this is disgusting
            return (this.channelToChannelWithSpecs(channel, member));
        }));
    }

    async getAllChannels(username: string = undefined): Promise<ChannelWithSpecs[]> {
        const channels = await this.channelRepository.find({
            where: [
                { members: { user: { username: Equal(username) }, active: true } },
                { members: { user: { username: Equal(username) }, invited: true } },
            ]
        });

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        return (channels.map((channel) => {
            const member = user ? this.channelMemberService.getActiveMember(channel, user.id) : null;
            return (this.channelToChannelWithSpecs(channel, member));
        }));
    }

    async getChannel(channelId: bigint, username: string = undefined, channelDetails: GetChannelParams): Promise<ChannelWithSpecs> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'messages.channelMember.user'],
        });
        
        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });
        
        await this.channelMemberService.canViewChannel(channel, user, channelDetails.password);

        return (this.channelToChannelWithSpecs(channel, this.channelMemberService.getActiveMember(channel, user.id)));
    }

    async createChannel(username: string = undefined, channelDetails: CreateChannelParams): Promise <ChannelWithSpecs> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        if (channelDetails.password) channelDetails.password = await this.passwordHashingService.hashPassword(channelDetails.password);

        const channel = this.channelRepository.create({
            ...channelDetails,
            members: [{ user: user, role: ChannelRole.OWNER, active: true, invited: false, muted: false, mutedSince: null, muteDuration: null, banned: false }],
        });

        await this.channelRepository.save(channel);
        return (this.channelToChannelWithSpecs(channel, this.channelMemberService.getActiveMember(channel, user.id)));
    }

    async createPrivateChannel(username: string = undefined, channelDetails: CreatePrivateChannelParams): Promise <ChannelWithSpecs> {
        if (!username) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        const usernames: string[] = [username, channelDetails.username];
        const users: User[] = await this.userService.findStrictlyUsersAndRelationshipsByUsername(usernames);
        const actingUser: User = users.splice(users.findIndex((user) => user.username === username), 1)[0];

        for (const user of users) {
            const blocked: boolean = actingUser.isOrHasBlocked(user.username);
            if (blocked) throw new ForbiddenException(`Cannot create a private channel with a blocked user or a user that blocked you`);
        }

        {
            const channel = await this.channelRepository.findOne({
                where: {
                    mode: ChannelMode.PRIVATE,
                    members: { user: { username: In(usernames) } },
                },
                relations: ['members'],
            });

            if (channel?.members?.length === usernames.length) throw new BadRequestException(`A private channel between ${usernames.join(', ')} already exists`);
        }

        await this.channelMemberService.canPrivateMessage(actingUser, users);

        const members = [
            { user: actingUser, role: ChannelRole.MEMBER, active: true, invited: true, muted: false, mutedSince: null, muteDuration: null, banned: false }
        ];
        for (const user of users) members.push(
            { user: user, role: ChannelRole.MEMBER, active: false, invited: true, muted: false, mutedSince: null, muteDuration: null, banned: false }
        );

        const channel = this.channelRepository.create({
            ...channelDetails,
            name: 'MP: ' + usernames.join(', '),
            visibility: ChannelVisibility.HIDDEN,
            mode: ChannelMode.PRIVATE,
            members: members,
        });

        await this.channelRepository.save(channel);
        return (this.channelToChannelWithSpecs(channel, this.channelMemberService.getActiveMember(channel, actingUser.id)));
    }

    async replaceChannel(channelId: bigint, username: string = undefined, channelDetails: ReplaceChannelParams): Promise<ChannelWithSpecs> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        await this.channelMemberService.canEditChannel(channel, user);

        if (channelDetails.password) channelDetails.password = await this.passwordHashingService.hashPassword(channelDetails.password);

        this.channelRepository.merge(channel, {
            ...channelDetails
        });

        await this.channelRepository.save(channel);
        return (this.channelToChannelWithSpecs(channel, this.channelMemberService.getActiveMember(channel, user.id)));
    }

    async updateChannel(channelId: bigint, username: string = undefined, channelDetails: UpdateChannelParams): Promise<ChannelWithSpecs> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        await this.channelMemberService.canEditChannel(channel, user);

        if (channelDetails.password) channelDetails.password = await this.passwordHashingService.hashPassword(channelDetails.password);

        this.channelRepository.merge(channel, {
            ...channelDetails
        });

        await this.channelRepository.save(channel);
        return (this.channelToChannelWithSpecs(channel, this.channelMemberService.getActiveMember(channel, user.id)));
    }

    async deleteChannel(channelId: bigint, username: string = undefined): Promise<string> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        await this.channelMemberService.canDeleteChannel(channel, user);

        await this.channelRepository.remove(channel);
        return (`Channel with ID ${channelId} successfully deleted`);
    }

    /* Non standard actions */

    async joinChannel(channelId: bigint, username: string = undefined, channelDetails: JoinChannelParams): Promise<ChannelWithSpecs> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: [
                'relationships1.user1', 'relationships1.user2',
                'relationships2.user1', 'relationships2.user2'
            ],
        });

        await this.channelMemberService.canJoinChannel(channel, user, channelDetails.password);

        const member = channel.members?.find((member) => member.user.username === username);
        if (!member) {
            this.channelRepository.merge(channel, {
                members: [...channel.members,
                    { user: user, role: ChannelRole.MEMBER, active: true, invited: false, muted: false, mutedSince: null, muteDuration: null, banned: false }
                ],
            });
        } else {
            member.role = ChannelRole.MEMBER;
            member.active = true;
        }

        channel.setupChannel();

        await this.channelRepository.save(channel);
        return (this.channelToChannelWithSpecs(channel, this.channelMemberService.getActiveMember(channel, user.id)));
    }

    async leaveChannel(channelId: bigint, username: string = undefined, channelDetails: LeaveChannelParams): Promise<ChannelWithSpecs | string> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        await this.channelMemberService.canLeaveChannel(channel, user);
        
        const member = this.channelMemberService.getMember(channel, user.id);
        member.role = ChannelRole.MEMBER;
        member.active = false;

        channel.setupChannel();

        if (channel.membersCount <= 0) {
            await this.channelRepository.remove(channel);
            return (`Channel with ID ${channelId} successfully deleted`);
        }

        await this.channelRepository.save(channel);
        return (this.channelToChannelWithSpecs(channel, this.channelMemberService.getActiveMember(channel, user.id)));
    }

    async manageChannelAccess(channelId: bigint, username: string = undefined, channelAccessDetails: ChannelAccessParams): Promise<ChannelWithSpecs> {
        let channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        await this.channelMemberService.canEditChannel(channel, user, channelAccessDetails.action);

        const usernames = channelAccessDetails.usernames;
        delete channelAccessDetails.usernames;

        const users = await this.userService.findStrictlyUsersByUsername(usernames);
        await this.channelMemberService.canUpdateUserPermissionsInChannel(channel, user, users, channelAccessDetails.action);

        switch (channelAccessDetails.action) {
            case (ChannelAccessAction.BAN):
                this.channelMemberService.ban(channel, users);
                break;
            case (ChannelAccessAction.DEBAN):
                this.channelMemberService.deban(channel, users);
                break;
            case (ChannelAccessAction.INVITE):
                this.channelMemberService.invite(channel, users);
                break;
            case (ChannelAccessAction.UNINVITE):
                this.channelMemberService.uninvite(channel, users);
                break;
            case (ChannelAccessAction.MUTE):
                this.channelMemberService.mute(channel, users, channelAccessDetails?.muteDuration);
                break;
            case (ChannelAccessAction.UNMUTE):
                this.channelMemberService.unmute(channel, users);
                break;
            case (ChannelAccessAction.KICK):
                this.channelMemberService.kick(channel, users);
                break;
            case (ChannelAccessAction.PROMOTE):
                this.channelMemberService.promote(channel, user, users);
                break;
            case (ChannelAccessAction.DEMOTE):
                this.channelMemberService.demote(channel, user, users);
                break;
            default:
                throw new BadRequestException(`Action not recognized`);
        }

        channel = await this.channelRepository.save(channel);

        return (this.channelToChannelWithSpecs(channel, this.channelMemberService.getActiveMember(channel, user.id)));
    }

    /* Helper functions */

    private channelToChannelWithSpecs(channel: Channel, member: ChannelMember): ChannelWithSpecs {
        return ({
            channel: channel,
            isMember: !!member,
            role: member ? member.role: null,
        } as ChannelWithSpecs);
    }

}
