import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "../../entities/Channel.entity";
import { Equal, Not, Repository } from "typeorm";
import { User } from "../../../../users/entities/User.entity";
import { UsersService } from "src/modules/users/services/users/users.service";
import { ChannelAccessParams, ChannelWithSpecs, CreateChannelParams, GetChannelParams, GetChannelsQueryParam, JoinChannelParams, LeaveChannelParams, ReplaceChannelParams, UpdateChannelParams } from "../../types/channel.type";
import { ChannelVisibility } from "../../enums/channel-visibility.enum";
import { ChannelMode } from "../../enums/channel-mode.enum";
import { ChannelRole } from "../../enums/channel-role.enum";
import { ChannelAccessAction } from "../../enums/channel-access-action.enum";
import { PasswordHashingService } from "../../../../password-hashing/services/password-hashing/password-hashing.service";

@Injectable()
export class ChannelsService {

    constructor(
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly userService: UsersService,
        private readonly passwordHashingService: PasswordHashingService,
    ) {}

    async getChannels(username: string = undefined, queryParams: GetChannelsQueryParam): Promise<ChannelWithSpecs[]> {
        let channels = await this.channelRepository.find({
            where: [
                { members: {
                    user: { username: Equal(username) },
                    hasLeft: false,
                } },
                { invitedUsers: { username: Equal(username) } },
                { visibility: Equal(ChannelVisibility.PUBLIC) },
            ],
            relations:  ['members.user'],
        });

        channels = channels.filter(channel => Object.entries(queryParams).every(([key, value]) =>
            value === undefined || channel[key] === value
        ));

        return (Promise.all(channels.map(async channel => {
            const member = channel.getMember(username);
            return ({
                channel: channel,
                isMember: !!member,
                role: member?.role,
            } as ChannelWithSpecs);
        })));
    }

    async getAllChannels(username: string = undefined): Promise<ChannelWithSpecs[]> {
        const channels = await this.channelRepository.find({
            where: [
                { members: {
                    user: { username: Equal(username) },
                    hasLeft: false,
                },
            },
            ],
        });

        return (Promise.all(channels.map(async channel => {
            const member = channel.getMember(username);
            return ({
                channel: channel,
                isMember: !!member,
                role: member?.role,
            } as ChannelWithSpecs);
        })));
    }

    async getChannel(channelId: bigint, username: string = undefined, channelDetails: GetChannelParams): Promise<ChannelWithSpecs> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'invitedUsers', 'bannedUsers', 'mutedUsers', 'messages.channelMember.user'],
        });
        
        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        channel.members = channel.members?.filter((member) => !member.hasLeft);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateAccess(user);
        if (channel.mode === ChannelMode.PASSWORD_PROTECTED && !(channel.isMember(username) || user.hasGlobalServerPrivileges())) {
            if (!channelDetails.password) throw new ForbiddenException(`A password is expected on Channel with ID ${channelId}`);
            else if (!await this.passwordHashingService.comparePasswords(channel.password, channelDetails.password)) throw new ForbiddenException(`Invalid password for Channel with ID ${channelId} and mode ${channel.mode}`);
        }

        const member = channel.getMember(username);

        return ({
            channel: channel,
            isMember: !!member,
            role: member?.role,
        } as ChannelWithSpecs);

        //return (channel);
    }

    async createChannel(username: string = undefined, channelDetails: CreateChannelParams): Promise<Channel> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);
        
        if (channelDetails.password) channelDetails.password = await this.passwordHashingService.hashPassword(channelDetails.password);

        const channel = this.channelRepository.create({
            ...channelDetails,
            members: [{ user, role: ChannelRole.OWNER }],
        });

        return (await this.channelRepository.save(channel));
    }

    async replaceChannel(channelId: bigint, username: string = undefined, channelDetails: ReplaceChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'invitedUsers', 'bannedUsers', 'mutedUsers', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateEditOrUpdate(user);

        if (channelDetails.password) channelDetails.password = await this.passwordHashingService.hashPassword(channelDetails.password);

        this.channelRepository.merge(channel, {
            ...channelDetails
        });

        return (await this.channelRepository.save(channel));
    }

    async updateChannel(channelId: bigint, username: string = undefined, channelDetails: UpdateChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'invitedUsers', 'bannedUsers', 'mutedUsers', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateEditOrUpdate(user);

        if (channelDetails.password) channelDetails.password = await this.passwordHashingService.hashPassword(channelDetails.password);

        this.channelRepository.merge(channel, {
            ...channelDetails
        });

        return (await this.channelRepository.save(channel));
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

        channel.validateDelete(user);

        await this.channelRepository.remove(channel);
        return (`Channel with ID ${channelId} successfully deleted`);
    }

    /* Non standard actions */

    async joinChannel(channelId: bigint, username: string = undefined, channelDetails: JoinChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'invitedUsers', 'bannedUsers', 'mutedUsers', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateJoin(user);
        if (channel.mode === ChannelMode.PASSWORD_PROTECTED && !(channel.isMember(username) || user.hasGlobalServerPrivileges())) {
            if (!channelDetails.password) throw new ForbiddenException(`A password is expected on Channel with ID ${channelId}`);
            else if (!await this.passwordHashingService.comparePasswords(channel.password, channelDetails.password)) throw new ForbiddenException(`Invalid password for Channel with ID ${channelId} and mode ${channel.mode}`);
        }

        const member = channel.members?.find((member) => member.user.username === username);
        if (!member) {
            this.channelRepository.merge(channel, {
                members: [...channel.members, { user, role: ChannelRole.MEMBER }],
            });
        } else {
            member.role = ChannelRole.MEMBER;
            member.hasLeft = false;
        }
    
        channel.setupChannel();

        return (await this.channelRepository.save(channel));
    }

    async leaveChannel(channelId: bigint, username: string = undefined, channelDetails: LeaveChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'invitedUsers', 'bannedUsers', 'mutedUsers', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateLeave(user);
        
        const member = channel.getMember(user.username);
        member.role = ChannelRole.MEMBER;
        member.hasLeft = true;

        channel.setupChannel();

        return (await this.channelRepository.save(channel));
    }

    async manageChannelAccess(channelId: bigint, username: string = undefined, channelAccessDetails: ChannelAccessParams) {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'invitedUsers', 'bannedUsers', 'mutedUsers', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateEditOrUpdate(user);

        const usernames = channelAccessDetails.usernames;
        delete channelAccessDetails.usernames;

        const users = await this.userService.findStrictlyUsersByUsername(usernames);

        channel.validatePermissionOnUsers(user, users);

        switch (channelAccessDetails.action) {
            case (ChannelAccessAction.BAN):
                channel.ban(users);
                break;
            case (ChannelAccessAction.DEBAN):
                channel.deban(users);
                break;
            case (ChannelAccessAction.INVITE):
                channel.invite(users);
                break;
            case (ChannelAccessAction.UNINVITE):
                channel.uninvite(users);
                break;
            case (ChannelAccessAction.MUTE):
                channel.mute(users);
                break;
            case (ChannelAccessAction.UNMUTE):
                channel.unmute(users);
                break;
            case (ChannelAccessAction.KICK):
                channel.kick(users);
                break;
            case (ChannelAccessAction.PROMOTE):
                channel.promote(user, users);
                break;
            case (ChannelAccessAction.DEMOTE):
                channel.demote(user, users);
                break;
            default:
                throw new BadRequestException(`Action not recognized`);
        }

        return (await this.channelRepository.save(channel));
    }

}
