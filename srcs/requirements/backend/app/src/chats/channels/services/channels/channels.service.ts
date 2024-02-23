import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, ChannelMode, ChannelVisibility } from '../../entities/Channel.entity';
import { Equal, Repository } from 'typeorm';
import { CreateChannelParams, GetChannelsQueryParam, ReplaceChannelParams, UpdateChannelParams } from '../../types/channel.type';
import { User } from 'src/users/entities/User.entity';
import { ChannelMember, ChannelRole } from '../../entities/ChannelMember.entity';
import { PasswordHashingService } from 'src/common/services/password-hashing/password-hashing.service';

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

    async getChannel(channelId: bigint, username: string = undefined): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user'],
        });
        
        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        channel.canVisualise(username);

        return (channel);
    }

    async createChannel(username: string = undefined, channelDetails: CreateChannelParams): Promise<Channel> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        console.log(channelDetails);
        //channelDetails.password ? await this.passwordHashingService.hashPassword(channelDetails.password) : null;

        const channel = this.channelRepository.create({
            ...channelDetails,
            members: [{ user, role: ChannelRole.ADMIN }],
        });

        return (await this.channelRepository.save(channel));
    }

    async replaceChannel(channelId: bigint, username: string = undefined, channelDetails: ReplaceChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        return (null);
    }

    async updateChannel(channelId: bigint, username: string = undefined, channelDetails: UpdateChannelParams): Promise<Channel> {
            const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        return (null);
    }

    /*
    async getChannelMembers(channelId: bigint, username: string = undefined): Promise<ChannelMember[]> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        });
        
        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        // recheck
        else if (channel.visibility !== ChannelVisibility.PUBLIC && !channel.isMember(username)) throw new UnauthorizedException(`User '${username ? username : '{undefined}'}' isn't member of Channel with ID ${channelId}`);

        return (channel.members);
    }

    async createChannel(username: string = undefined, channelDetails: CreateChannelParams): Promise<Channel> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        if (channelDetails.password) channelDetails.password = await this.passwordHashingService.hashPassword(channelDetails.password);

        const channel = this.channelRepository.create({
            ...channelDetails,
            members: [{ user, role: ChannelRole.ADMIN }],
        });

        return (await this.channelRepository.save(channel));
    }

    async replaceChannel(channelId: bigint, username: string = undefined, channelDetails: ReplaceChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        if (!channel.isMember(username)) throw new UnauthorizedException(`User '${username ? username : '{undefined}'}' isn't member of Channel with ID ${channelId}`);
        else if (!channel.hasPermission(username, ChannelRole.MODERATOR)) throw new UnauthorizedException(`User '${username ? username : '{undefined}'}' hasn't got enough permissions in Channel with ID ${channelId}`);

        if (channelDetails.password) channelDetails.password = await this.passwordHashingService.hashPassword(channelDetails.password);

        this.channelRepository.merge(channel, {
            ...channelDetails
        });

        return (await this.channelRepository.save(channel));
    }

    async updateChannel(channelId: bigint, username: string = undefined, channelDetails: UpdateChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        if (!channel.isMember(username)) throw new UnauthorizedException(`User '${username ? username : '{undefined}'}' isn't member of Channel with ID ${channelId}`);
        else if (!channel.hasPermission(username, ChannelRole.MODERATOR)) throw new UnauthorizedException(`User '${username ? username : '{undefined}'}' hasn't got enough permissions in Channel with ID ${channelId}`);

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

        if (!channel.isMember(username)) throw new UnauthorizedException(`User '${username ? username : '{undefined}'}' isn't member of Channel with ID ${channelId}`);
        else if (!channel.hasPermission(username, ChannelRole.ADMIN)) throw new UnauthorizedException(`User '${username ? username : '{undefined}'}' hasn't got enough permissions in Channel with ID ${channelId}`);

        await this.channelRepository.remove(channel);
        return (`Channel with ID ${channelId} successfully deleted`);
    }

    async joinChannel(channelId: bigint, username: string = undefined, channelDetails: JoinChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        if (channel.isMember(username)) throw new BadRequestException(`User '${username ? username : '{undefined}'}' is already member of Channel with ID ${channelId}`);
        else if (channel.password && !await this.passwordHashingService.comparePasswords(channel.password, channelDetails.password)) {
            throw new UnauthorizedException(`Channel with ID ${channelId} expects a valid password`);
        }

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        this.channelRepository.merge(channel, {
            members: [...channel.members, { user, role: ChannelRole.MEMBER }],
        });

        channel.setupChannel();

        return (await this.channelRepository.save(channel));
    }

    async leaveChannel(channelId: bigint, username: string = undefined, channelDetails: LeaveChannelParams): Promise<Channel | string> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        const memberIndex = channel.members.findIndex((member) => member.user.username === username);

        if (memberIndex === -1) throw new BadRequestException(`User '${username ? username : '{undefined}'}' isn't member of Channel with ID ${channelId}`);

        channel.members.splice(memberIndex, 1);

        channel.setupChannel();

        if (channel.members.length === 0) {
            await this.channelRepository.remove(channel);
            return (`Channel with ID ${channelId} has been deleted due to lack of members`);
        }
        return (await this.channelRepository.save(channel));
    }
    */

}
