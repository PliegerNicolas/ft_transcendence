import { User } from "src/users/entities/User";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'gameLogs' })
export class GameLog {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @ManyToMany(() => User, (user) => user.gameLogs, { onDelete: 'SET NULL' })
    users: User[];

}