import { IsEnum } from "class-validator";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/users/entities/User.entity";
import { Channel } from "./Channel.entity";
import { Message } from "src/chats/messages/entities/Message.entity";
import { ChannelRole } from "../enums/channel-role.enum";

@Entity({ name: 'channel_members' })
export class ChannelMember {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: bigint;

    @IsEnum(ChannelRole)
    @Column({ type: 'enum', enum: ChannelRole, default: ChannelRole.MEMBER })
    role: ChannelRole;

    @Column({ default: false })
    mute: boolean;

    @ManyToOne(() => Channel, (channel) => channel.members, { onDelete: 'CASCADE' })
    channel: Channel;

    @ManyToOne(() => User, (user) => user.channelMembers, { onDelete: 'CASCADE' })
    user: User;

    @OneToMany(() => Message, (messages) => messages.channelMember, { cascade: true, onDelete: 'CASCADE' }) // soft deletion ?
    messages?: Message[];

}