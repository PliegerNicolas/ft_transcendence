import { Type } from "class-transformer";
import { IsEnum, ValidateNested } from "class-validator";
import { User } from "src/users/entities/User";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

export enum FriendshipStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
    BLOCKED = 'blocked',
}

@Entity({ name: 'friendships' })
@Unique(['user1', 'user2'])
export class Friendship {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @ManyToOne(() => User, user1 => user1.friendships, { onDelete: 'CASCADE' })
    @ValidateNested()
    @Type(() => User)
    user1: User;

    @ManyToOne(() => User, user2 => user2.friendships, { onDelete: 'CASCADE' })
    @ValidateNested()
    @Type(() => User)
    user2: User;

    @IsEnum(FriendshipStatus)
    @Column({ type: 'enum', enum: FriendshipStatus, default: FriendshipStatus.ACCEPTED })
    status1: FriendshipStatus;

    @IsEnum(FriendshipStatus)
    @Column({ type: 'enum', enum: FriendshipStatus, default: FriendshipStatus.PENDING })
    status2: FriendshipStatus;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    last_update: Date;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @BeforeInsert()
    @BeforeUpdate()
    preventSelfFriendship() {
        if (this.user1?.id == this.user2?.id) {
            throw new Error('You cannot befriend yourself');
        }
    }

    /* Helper functions */

    setStatus(userId: number, newStatus: FriendshipStatus) {
        if (userId == this.user1.id) {
            this.status1 = newStatus;
        } else if (userId == this.user2.id) {
            this.status2 = newStatus;            
        }
        return (null);
    }

    status(userId: number) {
        if (userId == this.user1.id) {
            return (this.status1);
        } else if (userId == this.user2.id) {
            return (this.status2);
        }
        return (null);
    }

}