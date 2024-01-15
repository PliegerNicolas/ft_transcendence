import { Type } from "class-transformer";
import { IsEnum, ValidateNested } from "class-validator";
import { User } from "src/users/entities/User";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

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

    @BeforeInsert()
    @BeforeUpdate()
    preventSelfFriendship() {
        if (this.user1?.id == this.user2?.id) {
            throw new Error('You cannot befriend yourself');
        }
    }

}