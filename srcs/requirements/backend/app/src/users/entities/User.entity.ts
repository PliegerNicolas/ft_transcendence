import { ChannelMember } from "src/chats/channels/entities/ChannelMember.entity";
import { Message } from "src/chats/messages/entities/Message.entity";
import { GamelogToUser } from "src/gamelogs/entities/GamelogToUser.entity";
import { Profile } from "src/profiles/entities/Profile.entity";
import { Relationship } from "src/relationships/entities/Relationship.entity";
import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity({ name: 'users' })
@Unique(['email', 'username'])
export class User {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    email: string;

    @Column({ unique: true })
    username: string;

	@Column({ type: 'bigint', unique: true })
	oauthId: number;

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

    /* Chat */

    @OneToMany(() => ChannelMember, (member) => member.user)
    channelMembers?: ChannelMember[];

    /*
    @ManyToMany(() => Channel, (channel) => channel.members)
    channels?: Channel[];
    */

    @OneToMany(() => Message, (message) => message.user, { cascade: true })
    messages?: Message[];

    /* Helper Function */

    getRelationships(): Relationship[] {
        return ([...this.relationships1, ...this.relationships2]);
    }

}