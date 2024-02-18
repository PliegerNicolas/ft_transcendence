import { IsEnum } from "class-validator";
import { Message } from "src/chats/messages/entities/Message.entity";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ChannelMember } from "./ChannelMember.entity";

export enum ChannelStatus {
    PUBLIC = 'public',
    PRIVATE = 'private',
}

@Entity({ name: 'channels' })
export class Channel {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: bigint;

    @Column()
    name: string;

    @Column({ default: 0 })
    membersCount: number;

    @IsEnum(ChannelStatus)
    @Column({ type: 'enum', enum: ChannelStatus, default: ChannelStatus.PRIVATE })
    status: ChannelStatus;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany(() => ChannelMember, (member) => member.channel, { cascade: true })
    members?: ChannelMember[];

    @OneToMany(() => Message, (messages) => messages.channel, { cascade: true }) // soft deletion ?
    messages?: Message[];

    /* Helper Functions */

    @BeforeInsert()
    @BeforeUpdate()
    updateMembersCount(): void {
        this.membersCount = this.members.length;
    }

}