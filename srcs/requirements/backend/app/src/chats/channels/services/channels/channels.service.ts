import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, ChannelMode, ChannelVisibility } from '../../entities/Channel.entity';
import { Equal, In, Repository } from 'typeorm';
import { CreateChannelParams, GetChannelParams, GetChannelsQueryParam, JoinChannelParams, LeaveChannelParams, ManageChannelParams, ReplaceChannelParams, UpdateChannelParams } from '../../types/channel.type';
import { GlobalServerPrivileges, User } from 'src/users/entities/User.entity';
import { ChannelMember, ChannelRole } from '../../entities/ChannelMember.entity';
import { PasswordHashingService } from 'src/common/services/password-hashing/password-hashing.service';
import { ManageChannelAccessAction } from '../../dtos/ManageChannelAccess.dto';

@Injectable()
export class ChannelsService {

    constructor(
        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

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
            relations: ['members.user', 'invitedUsers', 'bannedUsers'],
        });
        
        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateAccess(user);
        if (
            channel.mode === ChannelMode.PASSWORD_PROTECTED
            //&& await this.passwordHashingService.comparePasswords(channelDetails.password, channel.password)
        ) throw new UnauthorizedException(`Invalid password for Channel with ID ${channelId} with mode ${channel.mode}`);

        return (channel);
    }

    async createChannel(username: string = undefined, channelDetails: CreateChannelParams): Promise<Channel> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);
        
        //channelDetails.password = await this.passwordHashingService.hashPassword(channelDetails.password);

        const channel = this.channelRepository.create({
            ...channelDetails,
            members: [{ user, role: ChannelRole.OWNER }],
        });

        return (await this.channelRepository.save(channel));
    }

    async replaceChannel(channelId: bigint, username: string = undefined, channelDetails: ReplaceChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'invitedUsers', 'bannedUsers'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateEditOrUpdate(user);
        if (
            channel.mode === ChannelMode.PASSWORD_PROTECTED
            && await this.passwordHashingService.comparePasswords(channelDetails.password, channel.password)
        ) throw new UnauthorizedException(`Invalid password for Channel with ID ${channelId} with mode ${channel.mode}`);

        this.channelRepository.merge(channel, {
            ...channelDetails
        });

        return (await this.channelRepository.save(channel));
    }

    async updateChannel(channelId: bigint, username: string = undefined, channelDetails: UpdateChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'invitedUsers', 'bannedUsers'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateEditOrUpdate(user);
        if (
            channel.mode === ChannelMode.PASSWORD_PROTECTED
            && await this.passwordHashingService.comparePasswords(channelDetails.password, channel.password)
        ) throw new UnauthorizedException(`Invalid password for Channel with ID ${channelId} with mode ${channel.mode}`);

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
            relations: ['members.user', 'invitedUsers', 'bannedUsers'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateJoin(user);
        if (
            channel.mode === ChannelMode.PASSWORD_PROTECTED
            && await this.passwordHashingService.comparePasswords(channelDetails.password, channel.password)
        ) throw new UnauthorizedException(`Invalid password for Channel with ID ${channelId} with mode ${channel.mode}`);

        this.channelRepository.merge(channel, {
            members: [...channel.members, { user, role: ChannelRole.MEMBER }],
        });

        channel.setupChannel();

        return (await this.channelRepository.save(channel));
    }

    async leaveChannel(channelId: bigint, username: string = undefined, channelDetails: LeaveChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'invitedUsers', 'bannedUsers'],
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

    async manageChannelAccess(channelId: bigint, username: string = undefined, channelDetails: ManageChannelParams) {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user', 'invitedUsers', 'bannedUsers'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        channel.validateEditOrUpdate(user);

        const users = await this.userRepository.find({
            where: { id: In(channelDetails.userIds) },
        });

        switch (channelDetails.action) {
            case (ManageChannelAccessAction.BAN):
                channel.ban(users);
                break;
            case (ManageChannelAccessAction.DEBAN):
                channel.deban(users);
                break;
            case (ManageChannelAccessAction.INVITE):
                channel.invite(users);
                break;
            case (ManageChannelAccessAction.UNINVITE):
                channel.uninvite(users);
                break;
            case (ManageChannelAccessAction.MUTE):
                channel.mute(users);
                break;
            case (ManageChannelAccessAction.UNMUTE):
                channel.unmute(users);
                break;
            case (ManageChannelAccessAction.KICK):
                channel.kick(users);
                break;
            default:
                throw new BadRequestException(`Action not recognized`);
        }

        return (await this.channelRepository.save(channel));
    }

}
