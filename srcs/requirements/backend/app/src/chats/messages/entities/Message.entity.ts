import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'messages' })
export class Message {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

}