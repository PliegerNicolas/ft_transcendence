import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Gamelog } from "./Gamelog.entity";
import { IsEnum } from "class-validator";
import { User } from "src/users/entities/User.entity";

export enum GameResult {
    VICTORY = 'victory',
    DEFEAT = 'defeat',
    TIE = 'tie',
    UNDEFINED = 'undefined',
}

@Entity({ name: 'user_to_gamelogs' })
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