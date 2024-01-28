import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChannelMember } from "./ChannelMember";
import { Message } from "src/chats/messages/entities/Message";

@Entity({ name: 'channels' })
export class Channel {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Message, (message) => message.channel)
    messages: Message[];

    @OneToMany(() => ChannelMember, (member) => member.channel)
    members: ChannelMember[];

}