import { Exclude, Expose } from "class-transformer";
import { IsEnum } from "class-validator";
import { GlobalServerPrivileges, compareGlobalServerPrivileges } from "../enums/global-server-privileges.enum";
import { Profile } from "../../profiles/entities/Profile.entity";
import { Relationship } from "../../relationships/entities/Relationship.entity";
import { GamelogToUser } from "../../gamelogs/entities/GamelogToUser.entity";
import { ChannelMember } from "../../chats/channels/entities/ChannelMember.entity";
import { File } from "../../file-uploads/entities/file.entity";
import { AfterLoad, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity({ name: 'users' })
@Unique(['email', 'username'])
export class User {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: bigint;

    @Column({ unique: true, length: 25 })
    username: string;

    @Column({ unique: true, length: 25 })
    accountname: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Exclude()
    @Column({nullable: true})
    twoFactorAuthSecret: string;

	@Column({default: false})
	isTwoFactorAuthEnabled: boolean;

    @Exclude()
    @Column()
    email: string;

    @Exclude()
    @Column({ type: 'bigint', unique: true })
    oauthId: bigint;

    //@Exclude()
    @IsEnum(GlobalServerPrivileges)
    @Column({ type: 'enum', enum: GlobalServerPrivileges, default: GlobalServerPrivileges.USER })
    globalServerPrivileges: GlobalServerPrivileges;

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

    /* Life cycles */

    @AfterLoad()
    private setRelationships(): void {
        this.relationships = [...(this.relationships1 ?? []), ...(this.relationships2 ?? [])];
    }

    public hasGlobalServerPrivileges(): boolean {
        return (compareGlobalServerPrivileges(this.globalServerPrivileges, GlobalServerPrivileges.OPERATOR) >= 0);
    }

    /* Helper Functions */

    isOrHasBlocked(username: string): boolean {
        if (!username) return (false);
        if (!this.relationships || this.relationships.length <= 0) return (false);
        return (this.relationships?.some((relationship) => relationship.userStatuses?.some((userStatus) => userStatus?.user.username === username)));
    }

}