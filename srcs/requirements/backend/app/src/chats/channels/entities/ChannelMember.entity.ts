import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'channel_members' })
export class ChannelMember {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

}