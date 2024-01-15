import { Friendship } from "src/friendships/entities/Friendships";
import { Profile } from "src/profiles/entities/Profile";
import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Repository, UpdateDateColumn, getRepository } from "typeorm";

@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
    profile: Profile

    @OneToMany(() => Friendship, (friendship) => friendship.user1, { cascade: true, onDelete: 'CASCADE' })
    friendships: Friendship[];
}