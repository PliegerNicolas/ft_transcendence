import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IsEnum } from "class-validator";
import { User } from "src/users/entities/User.entity";
import { GamelogToUser } from "./GamelogToUser.entity";

export enum GameType {
    PONG = "pong",
    UNDEFINED = "undefined",
}

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