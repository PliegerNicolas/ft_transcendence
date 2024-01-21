import { User } from "src/users/entities/User";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Gamelog } from "./Gamelog";
import { IsEnum } from "class-validator";

export enum GameResult {
    VICTORY = 'victory',
    DEFEAT = 'defeat',
    TIE = 'tie',
    UNDEFINED = 'undefined',
}

@Entity()
export class UserToGamelog {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @ManyToOne(() => User, (user) => user.userToGamelog)
    user: User;

    @ManyToOne(() => Gamelog, (gamelog) => gamelog.userToGamelog)
    gamelog: Gamelog;

    @IsEnum(GameResult)
    @Column({ type: 'enum', enum: GameResult, default: GameResult.UNDEFINED })
    result: GameResult;

}