import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'channels' })
export class Channel {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    name: string;

}