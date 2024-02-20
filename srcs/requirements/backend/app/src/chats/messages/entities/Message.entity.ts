import { Channel } from "src/chats/channels/entities/Channel.entity";
import { ChannelMember } from "src/chats/channels/entities/ChannelMember.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, Unique, UpdateDateColumn } from "typeorm";

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