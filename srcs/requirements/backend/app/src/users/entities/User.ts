import { GameLog } from "src/game-logs/entities/GameLog";
import { Profile } from "src/profiles/entities/Profile";
import { Relationship } from "src/relationships/entities/Relationship";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
    profile: Profile

    @ManyToMany(() => Relationship, (relationship) => relationship.users, { cascade: true })
    @JoinTable({ name: 'user_relationship'})
    relationships?: Relationship[];

    @ManyToMany(() => GameLog, (gameLog) => gameLog.users, { nullable: true })
    @JoinTable()
    gameLogs?: GameLog[];

}