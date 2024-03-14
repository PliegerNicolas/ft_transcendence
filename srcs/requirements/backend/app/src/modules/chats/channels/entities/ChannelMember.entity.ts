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

    @Column({ default: false })
    banned: boolean;

    @Column({ default: false })
    invited: boolean;

    @Column({ default: false })
    muted: boolean;

    //@Column({ default: () => Date.now() - (24 * 60 * 60 * 1000) })
    //mutedUntil: Date;

    @Column({ default: true })
    active: boolean;

    @ManyToOne(() => Channel, (channel) => channel.members, { onDelete: 'CASCADE' })
    channel: Channel;

    @ManyToOne(() => User, (user) => user.channelMembers, { onDelete: 'CASCADE' })
    user: User;

    @OneToMany(() => Message, (messages) => messages.channelMember, { cascade: true, onDelete: 'CASCADE' }) // soft deletion ?
    messages?: Message[];

}