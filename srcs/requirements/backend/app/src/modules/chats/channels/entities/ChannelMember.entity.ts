import { IsEnum } from "class-validator";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChannelRole } from "../enums/channel-role.enum";
import { User } from "../../../users/entities/User.entity";
import { Message } from "../../messages/entities/Message.entity";
import { Channel } from "./Channel.entity";

@Entity({ name: 'channel_members' })
export class ChannelMember {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: bigint;

    @IsEnum(ChannelRole)
    @Column({ type: 'enum', enum: ChannelRole, default: ChannelRole.MEMBER })
    role: ChannelRole;

    @Column({ default: false })
    banned: boolean;

    @Column({ default: false })
    invited: boolean;

    @Column({ default: false })
    muted: boolean;

    @Column({ nullable: true })
    mutedSince: Date;

    @Column({ nullable: true })
    muteDuration: number; // in seconds

    @Column({ default: true })
    active: boolean;

    @ManyToOne(() => Channel, (channel) => channel.members, { onDelete: 'CASCADE' })
    channel: Channel;

    @ManyToOne(() => User, (user) => user.channelMembers, { onDelete: 'CASCADE' })
    user: User;

    @OneToMany(() => Message, (messages) => messages.channelMember, { cascade: true, onDelete: 'CASCADE' }) // soft deletion ?
    messages?: Message[];

    /* Helper Functions */

    public mute(duration?: number): void {
        this.muted = true;
        if (duration) {
            this.mutedSince = new Date();
            this.muteDuration = duration;
        }
    }

    public unmute(): void {
        this.muted = false;
        this.mutedSince = null;
        this.muteDuration = null;
    }

    public isMuteExpired(): boolean {
        if (!this.muted || !this.mutedSince || !this.muteDuration) return (true);

        const expirationTime = new Date(this.mutedSince.getTime() + (this.muteDuration * 1000));
        return (expirationTime <= new Date());
    }

}
