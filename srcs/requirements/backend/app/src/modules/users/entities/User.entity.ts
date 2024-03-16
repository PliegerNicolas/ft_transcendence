import { Exclude } from "class-transformer";
import { IsEnum } from "class-validator";
import { AfterLoad, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { GlobalServerPrivileges, compareGlobalServerPrivileges } from "../enums/global-server-privileges.enum";
import { Profile } from "../../profiles/entities/Profile.entity";
import { Relationship } from "../../relationships/entities/Relationship.entity";
import { GamelogToUser } from "../../gamelogs/entities/GamelogToUser.entity";
import { ChannelMember } from "../../chats/channels/entities/ChannelMember.entity";
import { Channel } from "../../chats/channels/entities/Channel.entity";
import { File } from "../../file-uploads/entities/file.entity";

@Entity({ name: 'users' })
@Unique(['email', 'username'])
export class User {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: bigint;

    @Exclude()
    @Column({ type: 'bigint', unique: true })
    oauthId: bigint;

    @Exclude()
    @Column()
    email: string;

    @Column({ unique: true, length: 25 })
    username: string;

    @Column({ unique: true, length: 25 })
    accountname: string;

    @Exclude()
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

    @OneToOne(() => File, { cascade: true, nullable: true })
    @JoinColumn()
    picture?: File;

    /* Relationships */

    @Exclude()
    @OneToMany(() => Relationship, (relationship) => relationship.user1, { cascade: true })
    relationships1?: Relationship[];

    @Exclude()
    @OneToMany(() => Relationship, (relationship) => relationship.user2, { cascade: true })
    relationships2?: Relationship[];

    relationships: Relationship[];

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

    @ManyToMany(() => Channel, (channel) => channel.mutedUsers, { onDelete: 'CASCADE' })
    channelsMutedFrom?: Channel[];
	
	/* Two Factor Authentification */

    @Exclude()
    @Column({nullable: true})
    twoFactorAuthSecret: string;

	@Column({default: false})
	isTwoFactorAuthEnabled: boolean;

    /* Life Cycles */

    @AfterLoad()
    private setRelationships(): void {
        this.relationships = [...(this.relationships1 ?? []), ...(this.relationships1 ?? [])];
    }

    /* Helper Function */

    public hasGlobalServerPrivileges(): boolean {
        return (compareGlobalServerPrivileges(this.globalServerPrivileges, GlobalServerPrivileges.OPERATOR) >= 0);
    }

}