import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ChannelMember } from "../../channels/entities/ChannelMember.entity";
import { Channel } from "../../channels/entities/Channel.entity";

@Entity({ name: 'messages' })
export class Message {

    @PrimaryGeneratedColumn({ type: 'bigint' })
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