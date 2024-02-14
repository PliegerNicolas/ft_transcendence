import { User } from "src/users/entities/User.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'profiles' })
export class Profile {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: bigint;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

	@Column({nullable : true})
	image: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User
}