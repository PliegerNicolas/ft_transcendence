import { IsEnum } from "class-validator";
import { AfterLoad, AfterUpdate, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ChannelVisibility } from "../enums/channel-visibility.enum";
import { ChannelMode } from "../enums/channel-mode.enum";
import { User } from "../../../users/entities/User.entity";
import { ChannelMember } from "./ChannelMember.entity";
import { Message } from "../../messages/entities/Message.entity";
import { ChannelRole, compareChannelRoles, demoteChannelRole, promoteChannelRole } from "../enums/channel-role.enum";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Exclude } from "class-transformer";

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

    @Exclude()
    @Column({ nullable: true })
    password: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Exclude()
    @OneToMany(() => ChannelMember, (member) => member.channel, { cascade: true })
    members?: ChannelMember[];

    @OneToMany(() => Message, (messages) => messages.channel)
    messages?: Message[];

    invitedMembers?: ChannelMember[];
    bannedMembers?: ChannelMember[];
    mutedMembers?: ChannelMember[];
    activeMembers?: ChannelMember[];
    inactiveMembers?: ChannelMember[];

    /* Helper Functions */

    @AfterLoad()
    @AfterUpdate()
    afterLoad(): void {
        this.orderMessages();
        this.populateMemberStatusFields();
    }

    private orderMessages(): void {
        if (!this.messages || this.messages.length < 2) return ;
        this.messages.sort((a, b) => a.createdAt?.getTime() - b.createdAt?.getTime());
    }

    private populateMemberStatusFields(): void {
        this.invitedMembers = this.members?.filter((member) => member.invited) || [];
        this.bannedMembers = this.members?.filter((member) => member.banned) || [];
        this.mutedMembers = this.members?.filter((member) => member.muted) || [];
        this.activeMembers = [];
        this.inactiveMembers = [];
        this.members?.forEach((member) => {
            if (member.active) this.activeMembers.push(member);
            else this.inactiveMembers.push(member);
        });
    }

    @BeforeInsert()
    @BeforeUpdate()
    setupChannel(): void {
        this.updateMembersCount();
        this.ensureOwnerExists();
    }

    private updateMembersCount(): void {
        this.membersCount = this.members ? this.members.filter((member) => member.active).length : 0;
    }

    private ensureOwnerExists(): void {
        if (this.mode === ChannelMode.PRIVATE) return ;
        if (!this.members || this.members.length === 0) return ;
        if (this.members.some((member) => member.role === ChannelRole.OWNER && member.active)) return ;

        let highestRankMember: ChannelMember;

        for (const member of this.members) {
            if (!member.active) continue ;
            else if (!highestRankMember || compareChannelRoles(member.role, highestRankMember.role) > 0) highestRankMember = member;
        }

        if (highestRankMember) highestRankMember.role = ChannelRole.OWNER;
    }

}