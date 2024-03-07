import { IsEnum } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ChannelVisibility } from "../enums/channel-visibility.enum";
import { ChannelMode } from "../enums/channel-mode.enum";
import { User } from "../../../users/entities/User.entity";
import { ChannelMember } from "./ChannelMember.entity";
import { Message } from "../../messages/entities/Message.entity";
import { ChannelRole, compareChannelRoles, demoteChannelRole, promoteChannelRole } from "../enums/channel-role.enum";
import { BadRequestException, ForbiddenException } from "@nestjs/common";

@Entity({ name: 'channels' })
export class Channel {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: bigint;

    @Column()
    name: string;

    @IsEnum(ChannelVisibility)
    @Column({ type: 'enum', enum: ChannelVisibility, default: ChannelVisibility.HIDDEN })
    visibility: ChannelVisibility;

    @IsEnum(ChannelMode)
    @Column({ type: 'enum', enum: ChannelMode, default: ChannelMode.INVITE_ONLY })
    mode: ChannelMode;

    @Column({ default: 0 })
    membersCount: number;

    //@Exclude()
    @Column({ nullable: true })
    password: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToMany(() => User, (user) => user.channelsInvitedTo, { cascade: true })
    @JoinTable()
    invitedUsers?: User[];

    @ManyToMany(() => User, (user) => user.channelsBannedFrom, { cascade: true })
    @JoinTable()
    bannedUsers?: User[];

    @ManyToMany(() => User, (user) => user.channelsMutedFrom, { cascade: true })
    @JoinTable()
    mutedUsers?: User[];

    @OneToMany(() => ChannelMember, (member) => member.channel, { cascade: true })
    members?: ChannelMember[];

    @OneToMany(() => Message, (messages) => messages.channel) // soft deletion ?
    messages?: Message[];

    /* Helper Functions */

    @BeforeInsert()
    @BeforeUpdate()
    setupChannel(): void {
        this.updateMembersCount();
        this.ensureOwnerExists();
    }

    private updateMembersCount(): void {
        this.membersCount = this.members ? this.members.length : 0;
    }

    private ensureOwnerExists(): void {
        if (!this.members || this.members.length === 0) return ;
        else if (this.members.some((member) => member.role === ChannelRole.OWNER)) return ;

        const nextOwner = this.members?.reduce((prevMember, currentMember) => {
            return (prevMember.role < currentMember.role ? prevMember : currentMember);
        }, this.members[0]);

        nextOwner.role = ChannelRole.OWNER;
    }

    /* Check channel accessibility */

    public getMember(username: string): ChannelMember {
        return (this.members.find((member) => member.user.username === username));
    }

    public isMember(username: string): boolean {
        if (!this.members) return (false);
        return (this.members.some((member) => member.user.username === username));
    }

    public isInvited(username: string): boolean {
        if (!this.invitedUsers) return (false);
        return (this.invitedUsers.some((user) => user.username === username));
    }

    public isBanned(username: string): boolean {
        if (!this.bannedUsers) return (false);
        return (this.bannedUsers.some((user) => user.username === username));
    }

    public isMuted(username: string): boolean {
        if (!this.mutedUsers) return (false);
        return (this.mutedUsers.some((user) => user.username === username)); 
    }

    public isRankedEqualOrAbove(username: string, role: ChannelRole): boolean {
        const member = this.getMember(username);
        if (!member) return (false);
        return (compareChannelRoles(member.role, role) >= 0);
    }

    /* Manage channel accessibility */

    public invite(users: User[]): void {
        const invitedUserIds = new Set(this.invitedUsers.map((user) => user.id))
        this.invitedUsers.push(...users.filter((user) => !invitedUserIds.has(user.id)));
    }

    public ban(users: User[]): void {
        this.uninvite(users);
        const bannedUserIds = new Set(this.bannedUsers.map((user) => user.id))
        this.bannedUsers.push(...users.filter(user => !bannedUserIds.has(user.id)));
    }

    public kick(users: User[]): void {
        this.uninvite(users);
        this.members = this.members?.filter((member) => !users.some((user) => user.username === member.user.username));
    }

    public mute(users: User[]): void {
        const mutedUserIds = new Set(this.mutedUsers.map((user) => user.id))
        this.mutedUsers.push(...users.filter(user => !mutedUserIds.has(user.id)));
    }

    public uninvite(users: User[]): void {
        this.invitedUsers = this.invitedUsers?.filter((invitedUser) => !users.some((user) => user.username === invitedUser.username));
    }

    public deban(users: User[]): void {
        this.bannedUsers = this.bannedUsers?.filter((bannedUser) => !users.some((user) => user.username === bannedUser.username));
    }

    public unmute(users: User[]): void {
        this.mutedUsers = this.mutedUsers?.filter((mutedUser) => !users.some((user) => user.username === mutedUser.username))
    }

    public promote(user: User, users: User[]): void {
        const actingMember = this.getMember(user.username);
        if (!actingMember) throw new BadRequestException(`User ${actingMember.user.username ? actingMember.user.username : '{undefined}'} isn't member of Channel with ID ${this.id}`);

        this.members?.forEach((member) => {
            const foundUser = users.find((user) => user.username === member.user.username);
            if (foundUser && compareChannelRoles(actingMember.role, member.role) > 0) member.role = promoteChannelRole(member.role);
        });
    }

    public demote(user: User, users: User[]): void {
        const actingMember = this.getMember(user.username);
        if (!actingMember) throw new BadRequestException(`User ${actingMember.user.username ? actingMember.user.username : '{undefined}'} isn't member of Channel with ID ${this.id}`);

        this.members?.forEach((member) => {
            const foundUser = users.find((user) => user.username === member.user.username);
            if (foundUser && compareChannelRoles(actingMember.role, member.role) > 0) member.role = demoteChannelRole(member.role);
        });
    }

    /* Channel permissions */

    public validateAccess(user: User): void {
        if (!user) {
            if (this.visibility === ChannelVisibility.PUBLIC && this.mode === ChannelMode.OPEN) return ;
            throw new ForbiddenException(`User '{undefined}' isn't identified thus can only access Public and Open Channels.`);
        }
        if (user.hasGlobalServerPrivileges()) return ;

        const isMember = this.isMember(user.username);
        const isInvited = this.isInvited(user.username);
        const isBanned = this.isBanned(user.username);

        if (isBanned) throw new ForbiddenException(`User '${user.username}' isn't permitted to visualise Channel with ID ${this.id}`);

        switch(this.mode) {
            case (ChannelMode.OPEN):
                return ;
            case (ChannelMode.INVITE_ONLY):
                if (isInvited || isMember) return ;
                throw new ForbiddenException(`User '${user.username}' is neither member or invited to Channel with ID ${this.id}`);
            case (ChannelMode.PASSWORD_PROTECTED):
                if (isMember) return ;
                throw new ForbiddenException(`User '${user.username}' is neither member of Channel with ID ${this.id}`);
            default:
                throw new ForbiddenException(`Channel with ID ${this.id}'s mode not recognized`);
        }
    }

    public validateJoin(user: User): void {
        if (!user) throw new ForbiddenException(`User '{undefined}' isn't identified thus cannot join Channel with ID ${this.id}`);
        if (user.hasGlobalServerPrivileges()) return ;

        const isMember = this.isMember(user.username);
        const isInvited = this.isInvited(user.username);
        const isBanned = this.isBanned(user.username);

        if (isBanned) throw new ForbiddenException(`User '${user.username}' is not permitted to join Channel with ID ${this.id}`);
        if (isMember) throw new ForbiddenException(`User '${user.username}' is already member of Channel with ID ${this.id}`);

        switch(this.mode) {
            case (ChannelMode.OPEN):
                return ;
            case (ChannelMode.INVITE_ONLY):
                if (isInvited) return ;
                throw new ForbiddenException(`User '${user.username}' hasn't been invited to Channel with ID ${this.id}`);
            case (ChannelMode.PASSWORD_PROTECTED):
                return ; // Externally check the password
            default:
                throw new ForbiddenException(`Channel with ID ${this.id}'s mode not recognized`);
        }
    }

    public validateLeave(user: User): void {
        if (!user) throw new ForbiddenException(`User '{undefined}' isn't identified thus cannot leave Channel with ID ${this.id}`);
        if (user.hasGlobalServerPrivileges()) return ;

        const isMember = this.isMember(user.username);

        if (!isMember) throw new ForbiddenException(`User '${user.username}' isn't member of Channel with ID ${this.id} thus cannot leave it`);
    }

    public validateEditOrUpdate(user: User): void {
        if (!user) throw new ForbiddenException(`User '{undefined}' isn't identified thus cannot alter Channel with ID ${this.id}`);
        if (user.hasGlobalServerPrivileges()) return ;

        const isMember = this.isMember(user.username);

        if (!isMember) throw new ForbiddenException(`User '${user.username}' isn't member of Channel with ID ${this.id} thus cannot alter it`);

        if (!this.isRankedEqualOrAbove(user.username, ChannelRole.OPERATOR)) throw new ForbiddenException(`User '${user.username}' hasn't got enough permissions to alter Channel with ID ${this.id}`);
    }

    public validateDelete(user: User): void {
        if (!user) throw new ForbiddenException(`User '{undefined}' isn't identified thus cannot delete Channel with ID ${this.id}`);
        if (user.hasGlobalServerPrivileges()) return ;

        const isMember = this.isMember(user.username);

        if (!isMember) throw new ForbiddenException(`User '${user.username}' isn't member of Channel with ID ${this.id} thus cannot alter it`);

        if (!this.isRankedEqualOrAbove(user.username, ChannelRole.OWNER)) throw new ForbiddenException(`User '${user.username}' hasn't got enough permissions to alter Channel with ID ${this.id}`);
    }

    public validateWrite(user: User): void {
        if (!user) throw new ForbiddenException(`User '{undefined}' isn't identified thus cannot write in Channel with ID ${this.id}`);
        if (user.hasGlobalServerPrivileges()) return ;

        const isMember = this.isMember(user.username);

        if (!isMember) throw new ForbiddenException(`User '${user.username}' isn't member of Channel with ID ${this.id} thus cannot write in it`);
        if (this.isMuted(user.username)) throw new ForbiddenException(`User '${user.username}' is muted in Channel with ID ${this.id} thus cannot write in it`);
    }

}