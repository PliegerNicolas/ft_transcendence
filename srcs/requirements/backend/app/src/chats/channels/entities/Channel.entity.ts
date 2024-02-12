import { IsEnum } from "class-validator";
import { Message } from "src/chats/messages/entities/Message.entity";
import { User } from "src/users/entities/User.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChannelMember } from "./ChannelMember.entity";

export enum ChannelStatus {
    PUBLIC = 'public',
    PRIVATE = 'private',
}

@Entity({ name: 'channels' })
export class Channel {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    name: string;

    @Column({ default: 0 })
    membersCount: number;

    @IsEnum(ChannelStatus)
    @Column({ type: 'enum', enum: ChannelStatus, default: ChannelStatus.PRIVATE })
    status: ChannelStatus;

    @OneToMany(() => Message, (message) => message.channel, { cascade: true })
    messages?: Message[];

    @OneToMany(() => ChannelMember, (member) => member.channel, { cascade: true })
    members?: ChannelMember[];

    /* Helper Functions */

    @BeforeInsert()
    @BeforeUpdate()
    updateMembersCount(): void {
        this.membersCount = this.members.length;
    }

}