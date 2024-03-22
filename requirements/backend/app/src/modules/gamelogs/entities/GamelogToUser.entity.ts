import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameResult } from "../enums/game-result.enum";
import { IsEnum } from "class-validator";
import { User } from "../../users/entities/User.entity";
import { Gamelog } from "./Gamelog.entity";

@Entity({ name: 'gamelog_to_users' })
export class GamelogToUser {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: bigint;

    @IsEnum(GameResult)
    @Column({ type: 'enum', enum: GameResult, default: GameResult.TIE })
    result: GameResult;

    @ManyToOne(() => User, (user) => user.userToGamelogs, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Gamelog, (gamelog) => gamelog.gamelogToUsers, { onDelete: 'CASCADE' })
    gamelog: Gamelog;

}

// Add SOFT DELETE ?