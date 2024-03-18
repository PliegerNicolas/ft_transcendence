import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "../../entities/Channel.entity";
import { Equal, Repository } from "typeorm";
import { User } from "../../../../users/entities/User.entity";
import { UsersService } from "src/modules/users/services/users/users.service";
import { ChannelAccessParams, ChannelWithSpecs, CreateChannelParams, GetChannelParams, GetChannelsQueryParam, JoinChannelParams, LeaveChannelParams, ReplaceChannelParams, UpdateChannelParams } from "../../types/channel.type";
import { ChannelVisibility } from "../../enums/channel-visibility.enum";
import { ChannelRole } from "../../enums/channel-role.enum";
import { ChannelAccessAction } from "../../enums/channel-access-action.enum";
import { PasswordHashingService } from "../../../../password-hashing/services/password-hashing/password-hashing.service";
import { ChannelMembersService } from "../channel-members/channel-members.service";
import { ChannelMember } from "../../entities/ChannelMember.entity";

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
                { members: { user: { username: Equal(username) }, active: true } }
            ],
        });

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        return (channels.map((channel) => {
            const member = user ? this.channelMemberService.getActiveMember(channel, user.id) : null;
            return (this.channelToChannelWithSpecs(channel, member));
        }));
    }

    async getAllChannels(username: string = undefined): Promise<ChannelWithSpecs[]> {
        const channels = await this.channelRepository.find({
            where: { members: { user: { username: Equal(username) }, active: true } },
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
            members: [{ user: user, role: ChannelRole.OWNER, active: true, invited: false, muted: false, banned: false }],
        });

        await this.channelRepository.save(channel);
        return (this.channelToChannelWithSpecs(channel, this.channelMemberService.getActiveMember(channel, user.id)));
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
        let channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        await this.channelMemberService.canJoinChannel(channel, user, channelDetails.password);

        const member = channel.members?.find((member) => member.user.username === username);
        if (!member) {
            this.channelRepository.merge(channel, {
                members: [...channel.members, { user, role: ChannelRole.MEMBER }],
            });
        } else {
            member.role = ChannelRole.MEMBER;
            member.active = true;
        }

        channel.setupChannel();

        channel = await this.channelRepository.save(channel);

        return (this.channelToChannelWithSpecs(channel, this.channelMemberService.getActiveMember(channel, user.id)));
    }

    async leaveChannel(channelId: bigint, username: string = undefined, channelDetails: LeaveChannelParams): Promise<ChannelWithSpecs | string> {
        let channel = await this.channelRepository.findOne({
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

        channel = await this.channelRepository.save(channel);

        if (channel.membersCount <= 0) {
            await this.channelRepository.remove(channel);
            return (`Channel with ID ${channelId} successfully deleted`);
        }
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

        this.channelMemberService.canEditChannel(channel, user);

        const usernames = channelAccessDetails.usernames;
        delete channelAccessDetails.usernames;

        const users = await this.userService.findStrictlyUsersByUsername(usernames);
        await this.channelMemberService.canUpdateUserPermissionsInChannel(channel, user, users);

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
                this.channelMemberService.mute(channel, users);
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

        console.log("===  Manage Access ===");
        console.log(channel);

        return (this.channelToChannelWithSpecs(channel, this.channelMemberService.getActiveMember(channel, user.id)));
    }

    /* Helper functions */

    private channelToChannelWithSpecs(channel: Channel, member: ChannelMember): ChannelWithSpecs {
        return ({
            channel: channel,
            isMember: !!member,
            role: member?.role,
        } as ChannelWithSpecs);
    }

}
