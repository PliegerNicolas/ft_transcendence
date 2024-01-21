import { User } from "src/users/entities/User";
import { Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserToGamelog } from "./UserToGamelog";

@Entity({ name: 'gamelogs' })
export class Gamelog {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @ManyToMany(() => User, (user) => user.gamelogs, { cascade: true })
    users?: User[];

    @OneToMany(() => UserToGamelog, (userToGamelog) => userToGamelog.user, { cascade: true })
    @JoinTable()
    userToGamelog?: UserToGamelog[];

}