import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity({ name: 'profiles' })
export class Profile {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @OneToOne(() => User, (user) => user.profile)
    user: User;
}