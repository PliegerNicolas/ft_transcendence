import { Friendship } from "src/friendships/entities/Friendships";
import { Profile } from "src/profiles/entities/Profile";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Repository, getRepository } from "typeorm";

@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @OneToOne(() => Profile, (profile) => profile.user)
    profile: Profile

    @OneToMany(() => Friendship, (friendship) => friendship.user1, { cascade: true, onDelete: 'CASCADE' })
    friendships: Friendship[];
}