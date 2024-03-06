import { IsEnum } from "class-validator";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChannelRole } from "../enums/channel-role.enum";
import { User } from "../../../users/entities/User.entity";
import { Message } from "../../messages/entities/Message.entity";
import { Channel } from "./Channel.entity";

@Entity({ name: 'channel_members' })
export class ChannelMember {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: bigint;

    @IsEnum(ChannelRole)
    @Column({ type: 'enum', enum: ChannelRole, default: ChannelRole.MEMBER })
    role: ChannelRole;

    @ManyToOne(() => Channel, (channel) => channel.members, { onDelete: 'CASCADE' })
    channel: Channel;

    @ManyToOne(() => User, (user) => user.channelMembers, { onDelete: 'CASCADE' })
    user: User;

    @OneToMany(() => Message, (messages) => messages.channelMember, { cascade: true, onDelete: 'CASCADE' }) // soft deletion ?
    messages?: Message[];

}