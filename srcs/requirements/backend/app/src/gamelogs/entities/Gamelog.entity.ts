import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IsEnum } from "class-validator";
import { UserToGamelog } from "./UserToGamelog.entity";
import { User } from "src/users/entities/User.entity";

export enum GameType {
    PONG = "pong",
    UNDEFINED = "undefined",
}

@Entity({ name: 'gamelogs' })
export class Gamelog {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @IsEnum(GameType)
    @Column({ type: 'enum', enum: GameType, default: GameType.UNDEFINED })
    gameType: GameType;

    @OneToMany(() => UserToGamelog, (userToGamelog) => userToGamelog.gamelog, { cascade: true })
    userToGamelogs?: UserToGamelog[];

    @ManyToMany(() => User, (user) => user.gamelogs, { cascade: true })
    @JoinTable()
    users?: User[];

}