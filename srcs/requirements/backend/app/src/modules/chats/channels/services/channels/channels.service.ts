import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "../../entities/Channel.entity";
import { Equal, Repository } from "typeorm";
import { User } from "../../../../users/entities/User.entity";
import { UsersService } from "src/modules/users/services/users/users.service";
import { PasswordHashingService } from "../../../../../common/services/password-hashing/password-hashing.service";
import { ChannelAccessParams, CreateChannelParams, GetChannelParams, GetChannelsQueryParam, JoinChannelParams, LeaveChannelParams, ReplaceChannelParams, UpdateChannelParams } from "../../types/channel.type";
import { ChannelVisibility } from "../../enums/channel-visibility.enum";
import { ChannelMode } from "../../enums/channel-mode.enum";
import { ChannelRole } from "../../enums/channel-role.enum";
import { ChannelAccessAction } from "../../enums/channel-access-action.enum";

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

    async getChannels(username: string = undefined, queryParams: GetChannelsQueryParam): Promise<Channel[]> {
        const channels = await this.channelRepository.find({
            where: [
                { members: { user: { username: Equal(username) } } },
                { visibility: Equal(ChannelVisibility.PUBLIC) },
            ],
        });

        return (channels.filter(channel =>
            Object.entries(queryParams).every(([key, value]) =>
                value === undefined || channel[key] === value
            )
        ));
    }

    async getChannel(channelId: bigint, username: string = undefined, channelDetails: GetChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'invitedUsers', 'bannedUsers', 'messages.channelMember.user'],
        });
        
        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateAccess(user);
        if (
            channel.mode === ChannelMode.PASSWORD_PROTECTED
            && !await this.passwordHashingService.comparePasswords(channel.password, channelDetails.password)
        ) throw new UnauthorizedException(`Invalid password for Channel with ID ${channelId} and mode ${channel.mode}`);

        return (channel);
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
            relations: ['members.user', 'invitedUsers', 'bannedUsers', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateEditOrUpdate(user);
        if (
            channel.mode === ChannelMode.PASSWORD_PROTECTED
            && !await this.passwordHashingService.comparePasswords(channel.password, channelDetails.password)
        ) throw new UnauthorizedException(`Invalid password for Channel with ID ${channelId} and mode ${channel.mode}`);

        this.channelRepository.merge(channel, {
            ...channelDetails
        });

        return (await this.channelRepository.save(channel));
    }

    async updateChannel(channelId: bigint, username: string = undefined, channelDetails: UpdateChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'invitedUsers', 'bannedUsers', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateEditOrUpdate(user);
        if (
            channel.mode === ChannelMode.PASSWORD_PROTECTED
            && !await this.passwordHashingService.comparePasswords(channel.password, channelDetails.password)
        ) throw new UnauthorizedException(`Invalid password for Channel with ID ${channelId} and mode ${channel.mode}`);

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
            relations: ['members.user', 'invitedUsers', 'bannedUsers', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateJoin(user);
        if (
            channel.mode === ChannelMode.PASSWORD_PROTECTED
            && !await this.passwordHashingService.comparePasswords(channel.password, channelDetails.password)
        ) throw new UnauthorizedException(`Invalid password for Channel with ID ${channelId} and mode ${channel.mode}`);

        this.channelRepository.merge(channel, {
            members: [...channel.members, { user, role: ChannelRole.MEMBER }],
        });

        channel.setupChannel();

        return (await this.channelRepository.save(channel));
    }

    async leaveChannel(channelId: bigint, username: string = undefined, channelDetails: LeaveChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'invitedUsers', 'bannedUsers', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateLeave(user);
        channel.members = channel.members.filter((member) => member.user.username !== username);
        channel.setupChannel();

        return (await this.channelRepository.save(channel));
    }

    async manageChannelAccess(channelId: bigint, username: string = undefined, channelAccessDetails: ChannelAccessParams) {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'invitedUsers', 'bannedUsers', 'messages.channelMember.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateEditOrUpdate(user);

        const usernames = channelAccessDetails.usernames;
        delete channelAccessDetails.usernames;

        const users = await this.userService.findStrictlyUsersByUsername(usernames);

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
            default:
                throw new BadRequestException(`Action not recognized`);
        }

        return (await this.channelRepository.save(channel));
    }

}
