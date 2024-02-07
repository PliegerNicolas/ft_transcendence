import { Channel } from "src/chats/channels/entities/Channel.entity";
import { User } from "src/users/entities/User.entity";
import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity({ name: 'messages' })
@Unique(['channelId', 'messageId'])
export class Message {

    @PrimaryColumn({ type: 'bigint' })
    channelId: number;

    @PrimaryColumn({ type: 'bigint' })
    messageId: number;

    @Column()
    content: string;

    @ManyToOne(() => Channel, (channel) => channel.messages)
    channel: Channel;

    @ManyToOne(() => User, (user) => user.messages)
    user: User;

}