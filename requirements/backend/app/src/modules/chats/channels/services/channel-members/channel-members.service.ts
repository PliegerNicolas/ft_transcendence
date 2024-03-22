import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelMember } from '../../entities/ChannelMember.entity';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/User.entity';
import { Channel } from '../../entities/Channel.entity';
import { ChannelRole, compareChannelRoles, demoteChannelRole, promoteChannelRole } from '../../enums/channel-role.enum';
import { ChannelVisibility } from '../../enums/channel-visibility.enum';
import { ChannelMode } from '../../enums/channel-mode.enum';
import { PasswordHashingService } from 'src/modules/password-hashing/services/password-hashing/password-hashing.service';
import { ChannelAccessAction } from '../../enums/channel-access-action.enum';
import { Relationship } from 'src/modules/relationships/entities/Relationship.entity';
import { RelationshipStatus } from 'src/modules/relationships/enums/relationship-status.enum';

@Injectable()
export class ChannelMembersService {

    constructor(
        @InjectRepository(ChannelMember)
        private readonly channelMemberRepository: Repository<ChannelMember>,

        private readonly passwordHashingService: PasswordHashingService
    ) {}

    /* Invite */

    invite(channel: Channel, users: User[]): void {
        if (!channel.members) channel.members = [];
        if (!channel.invitedMembers) channel.invitedMembers = [];

        for (const user of users) {
            const member = this.getMember(channel, user.id);

            if (!member) {
                const newMember = this.channelMemberRepository.create({
                    channel,
                    user,
                    active: false,
                    banned: false,
                    invited: true,
                    muted: false,
                    mutedSince: null,
                    muteDuration: null,
                });
                channel.members.push(newMember);
                channel.invitedMembers.push(newMember);
            } else member.invited = true;
        }

        if (channel.mode === ChannelMode.PRIVATE) channel.mode = ChannelMode.INVITE_ONLY;
    }

    uninvite(channel: Channel, users: User[]): void {
        if (!channel.members) channel.members = [];
        if (!channel.invitedMembers) channel.invitedMembers = [];

        for (const user of users) {
            const member = this.getMember(channel, user.id);
            if (member) {
                member.invited = false;
                channel.invitedMembers = channel.invitedMembers.filter((invitedMember) => invitedMember.id !== member.id);
            }
        }
    }

    /* Ban */

    ban(channel: Channel, users: User[]): void {
        if (!channel.members) channel.members = [];
        if (!channel.bannedMembers) channel.bannedMembers = [];

        for (const user of users) {
            const member = this.getMember(channel, user.id);

            if (!member) {
                const newMember = this.channelMemberRepository.create({
                    channel,
                    user,
                    active: false,
                    banned: true,
                    invited: false,
                    muted: false,
                    mutedSince: null,
                    muteDuration: null,
                });
                channel.members.push(newMember);
                channel.bannedMembers.push(newMember);
            } else {
                member.banned = true;
                member.active = false;
                member.invited = false;
            }
        }
    }

    deban(channel: Channel, users: User[]): void {
        if (!channel.members) channel.members = [];
        if (!channel.bannedMembers) channel.bannedMembers = [];

        for (const user of users) {
            const member = this.getMember(channel, user.id);
            if (member) {
                member.banned = false;
                channel.bannedMembers = channel.bannedMembers.filter((bannedMember) => bannedMember.id !== member.id);
            }
        }
    }

    /* Muted */

    mute(channel: Channel, users: User[], duration?: number): void {
        if (!channel.members) channel.members = [];
        if (!channel.mutedMembers) channel.mutedMembers = [];

        for (const user of users) {
            const member = this.getMember(channel, user.id);

            if (!member) {
                const newMember = this.channelMemberRepository.create({
                    channel,
                    user,
                    active: false,
                    banned: false,
                    invited: false,
                    muted: false,
                    mutedSince: null,
                    muteDuration: null,
                });
                newMember.mute(duration);
                channel.members.push(newMember);
                channel.mutedMembers.push(newMember);
            } else {
                member.mute(duration);
            }
        }
    }

    unmute(channel: Channel, users: User[]): void {
        if (!channel.members) channel.members = [];
        if (!channel.mutedMembers) channel.mutedMembers = [];

        for (const user of users) {
            const member = this.getMember(channel, user.id);
            if (member) member.unmute();
        }
    }

    /* Kick */

    kick(channel: Channel, users: User[]): void {
        if (!channel.members) channel.members = [];
        if (!channel.invitedMembers) channel.invitedMembers = [];

        for (const user of users) {
            const member = this.getMember(channel, user.id);
            if (member) {
                member.active = false;
                member.invited = false;
            }
        }
    }

    /* Rank */

    promote(channel: Channel, actingUser: User, users: User[]): void {
        if (!channel.members) channel.members = [];

        const actingMember = this.getMember(channel, actingUser.id);
        if (!actingMember) throw new BadRequestException(`User ${actingMember.user.username ? actingMember.user.username : '{undefined}'} isn't member of Channel with ID ${channel.id}`);

        for (const user of users) {
            const member = this.getMember(channel, user.id);
            if (member && compareChannelRoles(actingMember.role, member.role) > 0) member.role = promoteChannelRole(member.role);
        }
    }

    demote(channel: Channel, actingUser: User, users: User[]): void {
        if (!channel.members) channel.members = [];

        const actingMember = this.getMember(channel, actingUser.id);
        if (!actingMember) throw new BadRequestException(`User ${actingMember.user.username ? actingMember.user.username : '{undefined}'} isn't member of Channel with ID ${channel.id}`);

        for (const user of users) {
            const member = this.getMember(channel, user.id);
            if (member && compareChannelRoles(actingMember.role, member.role) > 0) member.role = demoteChannelRole(member.role);
        }
    }

    /* Validations */

    async canViewChannel(channel: Channel, user: User, password?: string): Promise<void> {
        if (!user) {
            if (channel.visibility === ChannelVisibility.PUBLIC && channel.mode === ChannelMode.OPEN) return ;
            throw new ForbiddenException(`User isn't identified thus can only access Public and Open Channels`);
        } else if (user.hasGlobalServerPrivileges()) return ;

        if (this.isBanned(channel, user.id)) throw new ForbiddenException(`User '${user.username}' isn't permitted to visualise Channel with ID ${channel.id}`);

        switch(channel.mode) {
            case (ChannelMode.OPEN):
                return ;
            case (ChannelMode.INVITE_ONLY):
                if (this.isInvited(channel, user.id) || this.isActiveMember(channel, user.id)) return ;
                throw new ForbiddenException(`User '${user.username}' is neither member or invited to Channel with ID ${channel.id}`);
            case (ChannelMode.PASSWORD_PROTECTED):
                if (this.isActiveMember(channel, user.id)) return ;
                else if (!password) throw new ForbiddenException(`A password is needed for Channel with ID ${channel.id} and mode ${channel.mode}`);
                else if (await this.passwordHashingService.comparePasswords(channel.password, password)) return;
                throw new ForbiddenException(`Invalid password for Channel with ID ${channel.id} and mode ${channel.mode}`);
                case (ChannelMode.PRIVATE):
                    if (this.isInvited(channel, user.id) || this.isMember(channel, user.id)) {
                        for (const member of channel.members) {
                            if (user.isOrHasBlocked(member.user.username)) throw new ForbiddenException(`Cannot view a private channel with who you share a blocked relationship`);
                        }
                        return ;
                    };
                    throw new ForbiddenException(`User '${user.username}' is neither member or invited to Channel with ID ${channel.id}`);
            default:
                throw new UnprocessableEntityException(`Channel with ID ${channel.id}'s mode not recognized`);
        }
    }

    async canJoinChannel(channel: Channel, user: User, password?: string): Promise<void> {
        if (!user) throw new ForbiddenException(`User isn't identified thus cannot leave Channel with ID ${channel.id}`);
        else if (user.hasGlobalServerPrivileges()) return ;

        if (this.isBanned(channel, user.id)) throw new ForbiddenException(`User '${user.username}' isn't permitted to visualise Channel with ID ${channel.id}`);
        if (this.isActiveMember(channel, user.id)) throw new ForbiddenException(`User '${user.username}' is already member of Channel with ID ${channel.id}`);

        switch(channel.mode) {
            case (ChannelMode.OPEN):
                return ;
            case (ChannelMode.INVITE_ONLY):
                if (this.isInvited(channel, user.id)) return ;
                throw new ForbiddenException(`User '${user.username}' is not invited to Channel with ID ${channel.id}`);
            case (ChannelMode.PASSWORD_PROTECTED):
                if (!password) throw new ForbiddenException(`A password is needed for Channel with ID ${channel.id} and mode ${channel.mode}`);
                else if (await this.passwordHashingService.comparePasswords(channel.password, password)) return;
                throw new ForbiddenException(`Invalid password for Channel with ID ${channel.id} and mode ${channel.mode}`);
                case (ChannelMode.PRIVATE):
                    if (this.isInvited(channel, user.id)) {
                        for (const member of channel.members) {
                            if (user.isOrHasBlocked(member.user.username)) throw new ForbiddenException(`Cannot join a private channel with who you share a blocked relationship`);
                        }
                        return ;
                    }
                    throw new ForbiddenException(`User '${user.username}' is not invited to Channel with ID ${channel.id}`);
            default:
                throw new UnprocessableEntityException(`Channel with ID ${channel.id}'s mode not recognized`);
        }
    }

    async canLeaveChannel(channel: Channel, user: User): Promise<void> {
        if (!user) throw new ForbiddenException(`User isn't identified thus cannot leave Channel with ID ${channel.id}`);

        if (!this.isActiveMember(channel, user.id)) throw new ForbiddenException(`User '${user.username}' isn't member of Channel with ID ${channel.id} thus cannot leave it`);
    }

    async canEditChannel(channel: Channel, user: User, action?: ChannelAccessAction): Promise<void> {
        if (!user) throw new ForbiddenException(`User isn't identified thus cannot edit Channel with ID ${channel.id}`);
        else if (user.hasGlobalServerPrivileges()) return ;

        const member = this.getActiveMember(channel, user.id);

        if (!member) throw new ForbiddenException(`User '${user.username}' isn't member of Channel with ID ${channel.id} thus cannot edit it`);

        if (channel.mode === ChannelMode.PRIVATE) {
            if (action === ChannelAccessAction.INVITE || action === ChannelAccessAction.UNINVITE) return ;
            throw new ForbiddenException(`Channel with ID ${channel.id} is ${channel.mode}. It cannot be edited`);
        }

        if (compareChannelRoles(member.role, ChannelRole.OPERATOR) < 0) throw new ForbiddenException(`User '${user.username}' hasn't got enough permissions to edit Channel with ID ${channel.id}`);
    }

    async canDeleteChannel(channel: Channel, user: User): Promise<void> {
        if (!user) throw new ForbiddenException(`User isn't identified thus cannot edit Channel with ID ${channel.id}`);
        else if (user.hasGlobalServerPrivileges()) return ;

        const member = this.getActiveMember(channel, user.id);

        if (!member) throw new ForbiddenException(`User '${user.username}' isn't member of Channel with ID ${channel.id} thus cannot delete it`);

        if (channel.mode === ChannelMode.PRIVATE) throw new ForbiddenException(`Channel with ID ${channel.id} is ${channel.mode}. Both users have to leave it to delete it`);
        if (compareChannelRoles(member.role, ChannelRole.OWNER) < 0) throw new ForbiddenException(`User '${user.username}' hasn't got enough permissions to delete Channel with ID ${channel.id}`);
    }

    async canWriteInChannel(channel: Channel, user: User): Promise<void> {
        if (!user) throw new ForbiddenException(`User isn't identified thus cannot edit Channel with ID ${channel.id}`);
        else if (user.hasGlobalServerPrivileges()) return ;

        if (!this.isActiveMember(channel, user.id)) throw new ForbiddenException(`User '${user.username}' isn't member of Channel with ID ${channel.id} thus cannot write in it`);
        if (this.isMuted(channel, user.id)) throw new ForbiddenException(`User '${user.username}' is muted in Channel with ID ${channel.id} thus cannot write in it`);
    }

    async canUpdateUserPermissionsInChannel(channel: Channel, actingUser: User, users: User[], action?: ChannelAccessAction): Promise<void> {
        if (!actingUser) throw new ForbiddenException(`User isn't identified thus cannot edit Channel with ID ${channel.id}`);
        else if (actingUser.hasGlobalServerPrivileges()) return ;

        const actingMember = this.getActiveMember(channel, actingUser.id);
        if (!actingMember) throw new ForbiddenException(`User '${actingMember.user.username}' isn't member of Channel with ID ${channel.id} thus cannot edit it`);

        if (channel.mode === ChannelMode.PRIVATE) {
            if (action === ChannelAccessAction.INVITE || action === ChannelAccessAction.UNINVITE) return ;
            throw new ForbiddenException(`Channel with ID ${channel.id} is ${channel.mode}. Cannot alter member's permissions`);
        }

        const invalidUsernames: string[] = [];

        users.forEach((user) => {
            const targetMember = this.getMember(channel, user.id);
            if (targetMember && compareChannelRoles(actingMember.role, targetMember.role) <= 0) invalidUsernames.push(user.username);
        });

        if (invalidUsernames.length > 0) {
            throw new ForbiddenException(`User ${actingUser.username} hasn't got enough permissions to alter permissions of the following users: ${invalidUsernames.join(', ')}`);
        }
    }

    async canPrivateMessage(actingUser: User, users: User[]): Promise<void> {
        if (!actingUser) throw new ForbiddenException(`User isn't identified thus cannot create a ${ChannelMode.PRIVATE} channel`);
        else if (actingUser.hasGlobalServerPrivileges()) return ;
        
        const invalidUsernames: string[] = [];

        users.forEach((user) => {
            const relationship: Relationship = actingUser.relationships.find((related_user) => related_user.id === user.id);
            if (!relationship)
                return ;
            for (const userStatus of relationship.userStatuses) {
                if (userStatus?.status === RelationshipStatus.BLOCKED) invalidUsernames.push(userStatus.user.username);
            }
        });

        if (invalidUsernames.length > 0) {
            throw new UnauthorizedException(`Cannot build a ${ChannelMode.PRIVATE} with the following users: ${invalidUsernames.join(', ')} du to relationship status`);
        }
    }

    /* Helper Functions */

    public getMember(channel: Channel, userId: bigint): ChannelMember {
        if (!channel || !channel.members) return (null);
        return (channel.members?.find((member) => member.user.id === userId));
    }

    public getActiveMember(channel: Channel, userId: bigint): ChannelMember {
        if (!channel || !channel.activeMembers) return (null);
        return (channel.activeMembers.find((member) => member.user.id === userId));
    }

    public getInactiveMember(channel: Channel, userId: bigint): ChannelMember {
        if (!channel || !channel.inactiveMembers) return (null);
        return (channel.inactiveMembers.find((member) => member.user.id === userId));
    }

    public isMember(channel: Channel, userId: bigint): boolean {
        if (!channel) return (null);
        const members = [...channel?.activeMembers, ...channel?.inactiveMembers];
        return (!!members.find((member) => member.user.id === userId));
    }

    public isActiveMember(channel: Channel, userId: bigint): boolean {
        if (!channel || !channel.activeMembers) return (null);
        return (!!channel.activeMembers.find((member) => member.user.id === userId));
    }

    public isInactiveMember(channel: Channel, userId: bigint): boolean {
        if (!channel || !channel.inactiveMembers) return (null);
        return (!!channel.inactiveMembers.find((member) => member.user.id === userId));
    }

    public isInvited(channel: Channel, userId: bigint): boolean {
        if (!channel || !channel.invitedMembers) return (null);
        return (!!channel.invitedMembers.find((member) => member.user.id === userId));
    }

    public isBanned(channel: Channel, userId: bigint): boolean {
        if (!channel || !channel.bannedMembers) return (null);
        return (!!channel.bannedMembers.find((member) => member.user.id === userId));
    }

    public isMuted(channel: Channel, userId: bigint): boolean {
        if (!channel || !channel.mutedMembers) return (null);
        return (!!channel.mutedMembers.find((member) => member.user.id === userId));
    }

}
