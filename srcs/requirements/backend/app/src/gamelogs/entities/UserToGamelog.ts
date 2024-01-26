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

    @IsEnum(GameResult)
    @Column({ type: 'enum', enum: GameResult, default: GameResult.UNDEFINED })
    result: GameResult;

    @ManyToOne(() => Gamelog, (gamelog) => gamelog.userToGamelogs, { onDelete: 'CASCADE' })
    gamelog: Gamelog;

    @ManyToOne(() => User, (user) => user.userToGamelogs, { cascade: true, onDelete: 'CASCADE' })
    user: User;

}