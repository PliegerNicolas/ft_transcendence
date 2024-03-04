import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IsEnum } from "class-validator";
import { GamelogToUser } from "./GamelogToUser.entity";
import { GameType } from "../enums/game-type.enum";

@Entity({ name: 'gamelogs' })
export class Gamelog {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: bigint;

    @IsEnum(GameType)
    @Column({ type: 'enum', enum: GameType, default: GameType.UNDEFINED })
    gameType: GameType;

    @OneToMany(() => GamelogToUser, (gamelogToUser) => gamelogToUser.gamelog, { cascade: true })
    gamelogToUsers?: GamelogToUser[];

}