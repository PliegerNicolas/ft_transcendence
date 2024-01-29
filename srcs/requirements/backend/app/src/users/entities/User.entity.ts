import { Exclude } from "class-transformer";
import { Gamelog } from "src/gamelogs/entities/Gamelog.entity";
import { UserToGamelog } from "src/gamelogs/entities/UserToGamelog.entity";
import { Profile } from "src/profiles/entities/Profile.entity";
import { Relationship } from "src/relationships/entities/Relationship.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    username: string;

    @Exclude()
    @Column()
    password: string;

	@Column({type: 'bigint', unique:true})
	oauth_id: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    /* Profile */

    @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
    profile: Profile

    /* Relationships */

    @OneToMany(() => Relationship, (relationship) => relationship.user1, { cascade: true })
    relationships1?: Relationship[];

    @OneToMany(() => Relationship, (relationship) => relationship.user2, { cascade: true })
    relationships2?: Relationship[];

    /* Gamelogs */

    @OneToMany(() => UserToGamelog, (userToGamelog) => userToGamelog.user)
    userToGamelogs?: UserToGamelog[];

    @ManyToMany(() => Gamelog, (gamelog) => gamelog.users)
    gamelogs?: Gamelog[];

    /* Chat */

    /* Helper Function */

    getRelationships(): Relationship[] {
        return ([...this.relationships1, ...this.relationships2]);
    }

}