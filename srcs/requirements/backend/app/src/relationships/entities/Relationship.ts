import { BadRequestException } from "@nestjs/common";
import { IsEnum } from "class-validator";
import { User } from "src/users/entities/User";
import { BeforeInsert, BeforeRemove, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

export enum RelationshipStatus {
    BLOCKED = 'blocked',
    DECLINED = 'declined',
    UNDEFINED = 'undefined',
    PENDING = 'pending',
    ACCEPTED = 'accepted',
}

@Entity({ name: 'relationships' })
@Unique(['user1', 'user2'])
export class Relationship {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @ManyToOne(() => User, (user) => user.relationships1, { onDelete: 'CASCADE' })
    user1: User;

    @ManyToOne(() => User, (user) => user.relationships2, { onDelete: 'CASCADE' })
    user2: User;

    @IsEnum(RelationshipStatus)
    @Column({ type: 'enum', enum: RelationshipStatus, default: RelationshipStatus.UNDEFINED })
    status1: RelationshipStatus;

    @IsEnum(RelationshipStatus)
    @Column({ type: 'enum', enum: RelationshipStatus, default: RelationshipStatus.UNDEFINED })
    status2: RelationshipStatus;

    /* Helper Functions */

    @BeforeInsert()
    @BeforeUpdate()
    initializeRelationship(): void {
        this.preventSelfRelationship();
        this.reorderElements();
    }

    private preventSelfRelationship(): void {
        if (this.user1.id === this.user2.id) throw new BadRequestException('You cannot create a relationship with yourself');
    }

    private reorderElements(): void {
        if (this.user2.id < this.user1.id) {
            [this.user1, this.user2] = [this.user2, this.user1];
            [this.status1, this.status2] = [this.status2, this.status1];
        }
    }

    getUsers(): User[] {
        return ([this.user1, this.user2]);
    }

    setStatusById(userId: number, status: RelationshipStatus): void {
        if (this.user1.id == userId) this.status1 = status;
        else if (this.user2.id == userId) this.status2 = status;
    }

    setStatusOnCreation(status: RelationshipStatus): void {
        if (!status) status = RelationshipStatus.ACCEPTED;

        switch (status) {
            case (RelationshipStatus.ACCEPTED): {
                this.status1 = RelationshipStatus.ACCEPTED;
                this.status2 = RelationshipStatus.PENDING;
                break ;
            }
            case (RelationshipStatus.BLOCKED): {
                this.status1 = RelationshipStatus.BLOCKED;
                this.status2 = RelationshipStatus.UNDEFINED;
                break ;
            }
            default: {
                throw new BadRequestException(`Cannot initialize a relationship with given status (${status})`);
            }
        }
    }

    isDeletionPermitted(userId: number): void {
        const isBlockedOrDeclined = [RelationshipStatus.BLOCKED, RelationshipStatus.DECLINED];

        switch (true) {
            case (userId == this.user1.id): {
                if (isBlockedOrDeclined.includes(this.status2)) {
                    throw new BadRequestException(`Relationship cannot be deleted due to counterpart's status (${this.status2})`);
                }
                break ;
            }
            case (userId == this.user2.id): {
                if (isBlockedOrDeclined.includes(this.status1)) {
                    throw new BadRequestException(`Relationship cannot be deleted due to counterpart's status (${this.status1})`);
                }
                break ;
            }
            default: {
                throw new BadRequestException(`User with ID ${userId} isn't concerned by this relationship`);
            }
        }
    }

}