import { User } from "src/users/entities/User";
import { Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserToGamelog } from "./UserToGamelog";

@Entity({ name: 'gamelogs' })
export class Gamelog {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @OneToMany(() => UserToGamelog, (userToGamelog) => userToGamelog.gamelog, { cascade: true })
    userToGamelogs: UserToGamelog[];

    @ManyToMany(() => User, (user) => user.gamelogs)
    users?: User[];

}