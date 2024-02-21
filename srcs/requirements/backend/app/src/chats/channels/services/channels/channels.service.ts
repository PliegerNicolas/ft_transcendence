import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, ChannelStatus } from '../../entities/Channel.entity';
import { Equal, Repository } from 'typeorm';
import { CreateChannelParams, ReplaceChannelParams, UpdateChannelParams } from '../../types/channel.type';
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

    async getChannels(username: string = undefined, filterByStatus: ChannelStatus = undefined): Promise<Channel[]> {
        return (await this.channelRepository.find({
            where: [
                { members: { user: { username: Equal(username) } } },
                { status: filterByStatus ? Equal(filterByStatus) : Equal(ChannelStatus.PUBLIC) }, // not sure if this works
            ],
        }));
    }

    async getChannel(channelId: bigint, username: string = undefined): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        });
        
        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (
            channel.status !== ChannelStatus.PUBLIC // Also protect if password set or show members either way because PUBLIC ?
            && !channel.members.some((member) => member.user.username === username)
        ) throw new UnauthorizedException(`User '${username ? username : '{undefined}'}' isn't member of Channel with ID ${channelId}`);

        return (channel);
    }

    async getChannelMembers(channelId: bigint, username: string = undefined): Promise<ChannelMember[]> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        });
        
        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (
            channel.status !== ChannelStatus.PUBLIC // Also protect if password set or show members either way because PUBLIC ?
            && !channel.members.some((member) => member.user.username === username)
        ) throw new UnauthorizedException(`User '${username ? username : '{undefined}'}' isn't member of Channel with ID ${channelId}`);

        return (channel.members);
    }

    async createChannel(username: string = undefined, channelDetails: CreateChannelParams): Promise<Channel> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        channelDetails.password = await this.passwordHashingService.hashPassword(channelDetails.password);

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

        const member = channel.members.find((member) => member.user.username === username);

        if (!member) throw new UnauthorizedException(`User '${username ? username : '{undefined}'}' isn't member of Channel with ID ${channelId}`);
        else if (![ChannelRole.ADMIN].includes(member.role)) throw new UnauthorizedException(`User '${username ? username : '{undefined}'}' hasn't got enough permissions in Channel with ID ${channelId}`);

        return (await this.channelRepository.save({
            ...channel,
            ...channelDetails,
        }));
    }

    async updateChannel(channelId: bigint, username: string = undefined, channelDetails: UpdateChannelParams): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const member = channel.members.find((member) => member.user.username === username);

        if (!member) throw new UnauthorizedException(`User '${username ? username : '{undefined}'}' isn't member of Channel with ID ${channelId}`);
        else if (![ChannelRole.ADMIN].includes(member.role)) throw new UnauthorizedException(`User '${username ? username : '{undefined}'}' hasn't got enough permissions in Channel with ID ${channelId}`);

        return (await this.channelRepository.save({
            ...channel,
            ...channelDetails,
        }));
    }

    async deleteChannel(channelId: bigint, username: string = undefined): Promise<string> {
        const channel = await this.channelRepository.findOne({
            where: { id: Equal(channelId) },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const member = channel.members.find((member) => member.user.username === username);

        if (!member) throw new UnauthorizedException(`User '${username ? username : '{undefined}'}' isn't member of Channel with ID ${channelId}`);
        else if (![ChannelRole.ADMIN].includes(member.role)) throw new UnauthorizedException(`User '${username ? username : '{undefined}'}' hasn't got enough permissions in Channel with ID ${channelId}`);

        await this.channelRepository.remove(channel);
        return (`Channel with ID ${channelId} successfully deleted`);
    }

    /*
    async getChannels(userId: bigint = null): Promise<Channel[]> {
       return (await this.channelRepository.find({
            where: [
                { members: { user: { id: userId } } },
                { status: ChannelStatus.PUBLIC },
            ],
        }));
    }

    async getChannel(userId: bigint = null, channelId: bigint): Promise<Channel> {
        const channel = await this.channelRepository.findOne({
            where: {
                id: channelId,
            },
            relations: ['members.user'],
        });

        console.log(channel);

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.some((member) => BigInt(member.user.id) === userId)) {
            throw new UnauthorizedException(`User with ID ${userId} isn't member of channel with ID ${channelId}`);
        }

        return (channel);
    }

    async getChannelMembers(userId: bigint = null, channelId: bigint): Promise<ChannelMember[]> {
        const channel = await this.channelRepository.findOne({
            where: {
                id: channelId,
            },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.some((member) => BigInt(member.user.id) === userId)) {
            throw new UnauthorizedException(`User with ID ${userId} isn't member of channel with ID ${channelId}`);
        }

        return (channel.members);
    }

    async createChannel(userId: bigint = null, channelDetails: CreateChannelParams): Promise<Channel> {
        if (!userId) throw new UnauthorizedException('You should be logged in to create a Channel'); // Temp ?

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if  (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        if (channelDetails.password) {
            channelDetails.password = await this.passwordHashingService.hashPassword(channelDetails.password);
        }

        const channel = this.channelRepository.create({
            ...channelDetails,
            members: [{ user, role: ChannelRole.ADMIN }],
        });

        return (await this.channelRepository.save(channel))
    }

    async replaceChannel(userId: bigint = null, channelId: bigint, channelDetails: ReplaceChannelParams): Promise<Channel> {
        if (!userId) throw new UnauthorizedException('You should be logged in to replace a Channel'); // Temp ?

        const  channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        })

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.some((member) => BigInt(member.user.id) === userId)) {
            throw new UnauthorizedException(`User with ID ${userId} isn't member of Channel with ID ${channelId}`);
        }

        return (await this.channelRepository.save({
            ...channel,
            ...channelDetails,
        }));
    }

    async updateChannel(userId: bigint = null, channelId: bigint, channelDetails: UpdateChannelParams): Promise<Channel> {
        if (!userId) throw new UnauthorizedException('You should be logged in to update a Channel'); // Temp ?

        const  channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        })

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.some((member) => BigInt(member.user.id) === userId)) {
            throw new UnauthorizedException(`User with ID ${userId} isn't member of Channel with ID ${channelId}`);
        }

        return (await this.channelRepository.save({
            ...channel,
            ...channelDetails,
        }));
    }

    async joinChannel(userId: bigint = null, channelId: bigint) {
        if (!userId) throw new UnauthorizedException('You should be logged in to join a Channel'); // Temp ?

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (channel.members.some((member) => BigInt(member.user.id) === userId)) {
            throw new UnauthorizedException(`User with ID ${userId} is already member of channel with ID ${channelId}`);
        }

        return (await this.channelRepository.save({
            ...channel,
            membersCount: ++channel.membersCount,
            members: [...channel.members, {user, role: ChannelRole.MEMBER }],
        }));
    }

    async leaveChannel(userId: bigint = null, channelId: bigint) {
        if (!userId) throw new UnauthorizedException('You should be logged in to join a Channel'); // Temp ?

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);
        else if (!channel.members.some((member) => BigInt(member.user.id) === userId)) {
            throw new UnauthorizedException(`User with ID ${userId} is not member of channel with ID ${channelId}`);
        }

        return (await this.channelRepository.save({
            ...channel,
            membersCount: --channel.membersCount,
            members: channel.members.filter(member => member.user.id != userId),
        }));
    }

    async deleteChannel(userId: bigint = null, channelId: bigint): Promise<string> {
        const channel = await this.channelRepository.findOne({
            where: { id: channelId },
            relations: ['members.user'],
        });

        if (!channel) throw new NotFoundException(`Channel with ID ${channelId} not found`);

        const user = channel.members.find((member) => BigInt(member.user.id) === userId)

        if (!user) throw new UnauthorizedException(`User with ID ${userId} isn't member of channel with ID ${channelId}`);
        else if (user.role !== ChannelRole.ADMIN) throw new UnauthorizedException(`User with ID ${userId} hasn't got enough permissions to delete Channel with ID ${channelId}`);

        await this.channelRepository.remove(channel);
        return (`Channel with ID ${channelId} successfully deleted`);
    }
    */

}
