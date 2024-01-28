import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./Channel";
import { User } from "src/users/entities/User";

@Entity({ name: 'channelMembers' })
export class ChannelMember {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @ManyToOne(() => Channel, (channel) => channel.members)
    channel: Channel;

    @ManyToOne(() => User, (user) => user.channels)
    user: User;

}