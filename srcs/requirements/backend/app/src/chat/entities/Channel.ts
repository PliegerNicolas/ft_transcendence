import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from "typeorm"
import { User } from "src/users/entities/User";
import { Message } from "src/chat/entities/Message";

@Entity({ name: 'channels'})
export class Channel {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => User)
    users: User[];

    @OneToMany(() => Message, (message) => message.channel)
    messages: Message[];

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}