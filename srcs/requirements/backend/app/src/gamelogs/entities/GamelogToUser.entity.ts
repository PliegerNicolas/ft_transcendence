import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Gamelog } from "./Gamelog.entity";
import { IsEnum } from "class-validator";
import { User } from "src/users/entities/User.entity";
import { Exclude } from "class-transformer";

export enum GameResult {
    VICTORY = 'victory',
    DEFEAT = 'defeat',
    TIE = 'tie',
}

@Entity({ name: 'gamelog_to_users' })
export class GamelogToUser {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @IsEnum(GameResult)
    @Column({ type: 'enum', enum: GameResult, default: GameResult.TIE })
    result: GameResult;

    @ManyToOne(() => User, (user) => user.userToGamelogs, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Gamelog, (gamelog) => gamelog.gamelogToUsers, { onDelete: 'CASCADE' })
    gamelog: Gamelog;

}

// Add SOFT DELETE ?