import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'gameLogs' })
export class GameLog {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

}