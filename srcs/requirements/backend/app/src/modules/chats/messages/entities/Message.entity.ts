import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryColumn, Unique, UpdateDateColumn } from "typeorm";
import { ChannelMember } from "../../channels/entities/ChannelMember.entity";
import { User } from "../../../users/entities/User.entity";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Channel } from "../../channels/entities/Channel.entity";
import { ChannelRole } from "../../channels/enums/channel-role.enum";

@Entity({ name: 'messages' })
@Unique(['id', 'channelId'])
export class Message {

    @PrimaryColumn({ type: 'bigint' })
    id: bigint;

    @PrimaryColumn({ type: 'bigint' })
    channelId: bigint;

    @Column()
    content: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToOne(() => Channel, (channel) => channel.messages, { onDelete: 'CASCADE' })
    channel: Channel;

    @ManyToOne(() => ChannelMember, (channelMember) => channelMember.messages, { onDelete: 'CASCADE' })
    channelMember: ChannelMember;

}