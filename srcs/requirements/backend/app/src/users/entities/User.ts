import { GameLog } from "src/game-logs/entities/GameLog";
import { Profile } from "src/profiles/entities/Profile";
import { Relationship } from "src/relationships/entities/Relationship";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

	@Column({type: 'bigint', unique:true})
	oauth_id: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
    profile: Profile

    @OneToMany(() => Relationship, (relationship) => relationship.user1, { cascade: true })
    relationships1?: Relationship[];

    @OneToMany(() => Relationship, (relationship) => relationship.user2, { cascade: true })
    relationships2?: Relationship[];

    @ManyToMany(() => GameLog, (gameLog) => gameLog.users, { nullable: true })
    @JoinTable()
    gameLogs?: GameLog[];

    /* Helper Function */

    getRelationships(): Relationship[] {
        return ([...this.relationships1, ...this.relationships2]);
    }

}