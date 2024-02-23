import { IsEnum, isIn } from "class-validator";
import { Message } from "src/chats/messages/entities/Message.entity";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ChannelMember, ChannelRole } from "./ChannelMember.entity";
import { Exclude } from "class-transformer";
import { GlobalServerPrivileges, User } from "src/users/entities/User.entity";
import { UnauthorizedException } from "@nestjs/common";

export enum ChannelVisibility {
    PUBLIC = 'public',
    PRIVATE = 'private',
}

export enum ChannelMode {
    OPEN = 'open',
    INVITE_ONLY = 'invite_only',
    PASSWORD_PROTECTED = 'password_protected',
}

@Entity({ name: 'channels' })
export class Channel {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: bigint;

    @Column()
    name: string;

    @IsEnum(ChannelVisibility)
    @Column({ type: 'enum', enum: ChannelVisibility, default: ChannelVisibility.PRIVATE })
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

    @OneToMany(() => ChannelMember, (member) => member.channel, { cascade: true })
    members?: ChannelMember[];

    @OneToMany(() => Message, (messages) => messages.channel) // soft deletion ?
    messages?: Message[];

    /* Helper Functions */

    @BeforeInsert()
    @BeforeUpdate()
    setupChannel(): void {
        this.updateMembersCount();
        this.ensureAdminExists();
    }

    private updateMembersCount(): void {
        this.membersCount = this.members ? this.members.length : 0;
    }

    private ensureAdminExists(): void {
        if (this.members.length === 0 || this.members.some((member) => member.role === ChannelRole.ADMIN)) return ;
        let nextAdmin = this.members.find((member) => member.role === ChannelRole.MODERATOR);
        if (!nextAdmin) nextAdmin = this.members[0];
        nextAdmin.role = ChannelRole.ADMIN;
    }

    // User status

    public isMember(username: string): boolean {
        return (this.members?.some((member) => member.user.username === username));
    }

    public isInvited(username: string): boolean {
        return (this.invitedUsers?.some((user) => user.username === username)); 
    }

    public isBanned(username: string): boolean {
        return (this.bannedUsers?.some((user) => user.username === username)); 
    }

    // Role in Channel

    public hasSuperiorRole(username: string, role: ChannelRole): boolean {
        const member = this.members?.find((member) => member.user.username === username);
        if (!member) return (false);
        else return (member?.role < role);
    }

    public hasSuperiorOrEqualRole(username: string, role: ChannelRole): boolean {
        const member = this.members?.find((member) => member.user.username === username);
        if (!member) return (false);
        else return (member?.role <= role);
    }

    // Channel permissions

    public canVisualise(username: string): void {
        if (!username) {
            if (this.visibility === ChannelVisibility.PUBLIC && this.mode === ChannelMode.OPEN) return;
            throw new UnauthorizedException(`User 'undefined' isn't identified and Channel with ID ${this.id} isn't a Public and Open Channel`);
        }

        const isBanned = this.isBanned(username);
        const isInvited = this.isInvited(username);
        const isMember = this.isMember(username);

        if (isBanned) throw new UnauthorizedException(`User '${username}' is not permitted to visualise Channel with ID ${this.id}`);

        switch(this.mode) {
            case (ChannelMode.OPEN):
                return ;
            case (ChannelMode.INVITE_ONLY):
                if (isInvited || isMember) return ;
                throw new UnauthorizedException(`User '${username}' is neither member or invited to Channel with ID ${this.id}`);
            case (ChannelMode.PASSWORD_PROTECTED):
                return ; // Externally check the password
            default:
                throw new UnauthorizedException(`Channel with ID ${this.id}'s mode not recognized`);
        }
    }

    public canJoin(username: string): boolean {
        if (!username) throw new UnauthorizedException(`User '{undefined}' isn't identified and cannot join Channel with ID ${this.id}`);

        const isBanned = this.isBanned(username);
        const isInvited = this.isInvited(username);
        const isMember = this.isMember(username);

        if (isBanned) throw new UnauthorizedException(`User '${username}' is not permitted to join Channel with ID ${this.id}`);
        else if (isMember) throw new UnauthorizedException(`User '${username}' is already member of Channel with ID ${this.id}`);

        switch(this.mode) {
            case (ChannelMode.OPEN):
                return ;
            case (ChannelMode.INVITE_ONLY):
                if (isInvited) return ;
                throw new UnauthorizedException(`User '${username}' hasn't been invited to Channel with ID ${this.id}`);
            case (ChannelMode.PASSWORD_PROTECTED):
                return ; // Externally check the password
            default:
                throw new UnauthorizedException(`Channel with ID ${this.id}'s mode not recognized`);
        }
    }

    public canLeave(username: string): void {
        if (!username) throw new UnauthorizedException(`User '{undefined}' isn't identified and cannot leave Channel with ID ${this.id}`);

        const isMember = this.isMember(username);

        if (!isMember) throw new UnauthorizedException(`User '${username}' isn't member of Channel with ID ${this.id}`);
    }

    public canEditOrUpdate(username: string): void {
        if (!username) throw new UnauthorizedException(`User '{undefined}' isn't identified and cannot alter Channel with ID ${this.id}`);
        else if (!this.isMember(username)) throw new UnauthorizedException(`User '${username}' isn't member of Channel with ID ${this.id} and cannot alter it`);

        if (!this.hasSuperiorOrEqualRole(username, ChannelRole.MODERATOR)) throw new UnauthorizedException(`User '${username}' hasn't got enough permissions to alter Channel with ID ${this.id}`);
    }

    public canWrite(username: string): void {
        if (!username) throw new UnauthorizedException(`User '{undefined}' isn't identified and cannot write in Channel with ID ${this.id}`);

        if (!this.isMember(username)) throw new UnauthorizedException(`User '${username}' isn't member of Channel with ID ${this.id} and cannot write in it`);

        // check if muted. Not set yet.
    }

    public canDelete(username: string): void {
        if (!username) throw new UnauthorizedException(`User '{undefined}' isn't identified and cannot write in Channel with ID ${this.id}`);
        if (!this.hasSuperiorOrEqualRole(username, ChannelRole.ADMIN)) throw new UnauthorizedException(`User '${username}' hasn't got enough permissions to delete Channel with ID ${this.id}`);
    }

}