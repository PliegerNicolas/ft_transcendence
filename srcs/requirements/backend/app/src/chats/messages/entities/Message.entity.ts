import { Channel } from "src/chats/channels/entities/Channel.entity";
import { User } from "src/users/entities/User.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'messages' })
export class Message {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    content: string;

    @ManyToOne(() => Channel, (channel) => channel.messages)
    channel: Channel;

    @ManyToOne(() => User, (user) => user.messages)
    user: User;

}