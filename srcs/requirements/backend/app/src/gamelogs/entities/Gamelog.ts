import { User } from "src/users/entities/User";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserToGamelog } from "./UserToGamelog";
import { IsEnum } from "class-validator";

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
    userToGamelogs: UserToGamelog[];

    @ManyToMany(() => User, (user) => user.gamelogs)
    users?: User[];

}