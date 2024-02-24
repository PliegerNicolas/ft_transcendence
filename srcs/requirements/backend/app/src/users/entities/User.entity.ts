import { Exclude } from "class-transformer";
import { IsEnum } from "class-validator";
import { Channel } from "src/chats/channels/entities/Channel.entity";
import { ChannelMember } from "src/chats/channels/entities/ChannelMember.entity";
import { GamelogToUser } from "src/gamelogs/entities/GamelogToUser.entity";
import { Profile } from "src/profiles/entities/Profile.entity";
import { Relationship } from "src/relationships/entities/Relationship.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { GlobalServerPrivileges } from "../enums/global-server-privileges.enum";

@Entity({ name: 'users' })
@Unique(['email', 'username'])
export class User {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: bigint;

    @Column({ type: 'bigint', unique: true })
    oauthId: bigint;

    @Exclude() // Exclude ?
    @Column()
    email: string;

    @Column({ unique: true, length: 25 })
    username: string;

    //@Exclude() // Exclude ?
    @IsEnum(GlobalServerPrivileges)
    @Column({ type: 'enum', enum: GlobalServerPrivileges, default: GlobalServerPrivileges.USER })
    globalServerPrivileges: GlobalServerPrivileges;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    /* Profile */

    @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
    profile: Profile

    /* Relationships */

    @OneToMany(() => Relationship, (relationship) => relationship.user1, { cascade: true })
    relationships1?: Relationship[];

    @OneToMany(() => Relationship, (relationship) => relationship.user2, { cascade: true })
    relationships2?: Relationship[];

    /* Gamelogs */

    @OneToMany(() => GamelogToUser, (userToGamelogs) => userToGamelogs.user)
    userToGamelogs?: GamelogToUser[];

    /* Chats */

    @OneToMany(() => ChannelMember, (member) => member.user)
    channelMembers?: ChannelMember[];

    @ManyToMany(() => Channel, (channel) => channel.invitedUsers, { onDelete: 'CASCADE' })
    channelsInvitedTo?: Channel[];

    @ManyToMany(() => Channel, (channel) => channel.bannedUsers, { onDelete: 'CASCADE' })
    channelsBannedFrom?: Channel[];

    /* Helper Function */

    public getRelationships(): Relationship[] {
        return ([...this.relationships1, ...this.relationships2]);
    }

    public hasGlobalServerPrivileges(): boolean {
        return (this.globalServerPrivileges > GlobalServerPrivileges.USER);
    }

}