import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, Unique, UpdateDateColumn } from "typeorm";
import { ChannelMember } from "../../channels/entities/ChannelMember.entity";
import { User } from "../../../users/entities/User.entity";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Channel } from "../../channels/entities/Channel.entity";
import { ChannelRole } from "../../channels/enums/channel-role.enum";

@Entity({ name: 'messages' })
@Unique(['id', 'channelId'])
export class Message {

    @PrimaryColumn({ type: 'bigint' })
    id: bigint;

    @PrimaryColumn({ type: 'bigint' })
    channelId: bigint;

    @Column()
    content: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToOne(() => Channel, (channel) => channel.messages, { onDelete: 'CASCADE' })
    channel: Channel;

    @ManyToOne(() => ChannelMember, (channelMember) => channelMember.messages, { onDelete: 'CASCADE' })
    channelMember: ChannelMember;

    /* Helper functions */

    public isMessageOwner(user: User): boolean {
        if (!user) return (false);
        return (this.channelMember?.user.username === user.username);
    }

    public validateReplaceOrUpdate(user: User) {
        if (!user) throw new NotFoundException(`User '{undefined}' not found`);
        if (!this.channel?.isMember(user.username)) throw new UnauthorizedException(`User '${user.username}' isn't member of Channel with ID ${this.channelId}`);
        if (!this.isMessageOwner(user)) throw new UnauthorizedException(`User '${user.username}' isn't owner of Message with ID ${this.id} of Channel with ID ${this.channelId}`);
    }

    public validateDelete(user: User) {
        if (!user) throw new NotFoundException(`User '{undefined}' not found`);
        if (!this.channel?.isMember(user.username)) throw new UnauthorizedException(`User '${user.username ? user.username : '{undefined}'}' isn't member of Channel with ID ${this.channelId}`);
        if (!this.isMessageOwner(user) && !this.channel.isRankedEqualOrAbove(user.username, ChannelRole.OPERATOR)) throw new UnauthorizedException(`User '${user.username}' isn't owner of Message with ID ${this.id} of Channel with ID ${this.channelId} or has an insufficient role`);
    }

}