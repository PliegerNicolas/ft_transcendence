import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToOne, OneToMany, ManyToOne } from "typeorm"
import { User } from "src/users/entities/User";
import { Channel } from "src/chat/channels/entities/Channel";

@Entity({ name: 'messages'})
export class Message {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ unique: true })
    content: string;

    @ManyToOne(() => User)
    sender: User;

	@ManyToOne(() => Channel, (channel) => channel.messages)
    channel: Channel;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    sent_at: Date;
}