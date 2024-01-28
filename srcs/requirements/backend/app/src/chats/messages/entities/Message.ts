import { Channel } from "src/chats/channels/entities/Channel";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'messages' })
export class Message {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    content: string;

    @ManyToOne(() => Channel, (channel) => channel.messages)
    channel: Channel;

}