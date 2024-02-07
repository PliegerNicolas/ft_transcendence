import { IsEnum } from "class-validator";
import { Message } from "src/chats/messages/entities/Message.entity";
import { User } from "src/users/entities/User.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum ChannelStatus {
    PUBLIC = 'public',
    PRIVATE = 'private',
}

@Entity({ name: 'channels' })
export class Channel {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    name: string;

    @IsEnum(ChannelStatus)
    @Column({ type: 'enum', enum: ChannelStatus, default: ChannelStatus.PRIVATE })
    status: ChannelStatus;

    @OneToMany(() => Message, (message) => message.channel, { cascade: true })
    messages?: Message[];

    @ManyToMany(() => User, (member) => member.channels, { cascade: true })
    @JoinTable({ name: 'channel_members' })
    members?: User[];

}