import { BadRequestException } from "@nestjs/common";
import { IsEnum, Validate } from "class-validator";
import { User } from "src/users/entities/User";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

export enum RelationshipStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
    BLOCKED = 'blocked',
}

@Entity({ name: 'relationships' })
@Unique(['user1', 'user2'])
export class Relationship {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @IsEnum(RelationshipStatus)
    @Column({ type: 'enum', enum: RelationshipStatus, default: RelationshipStatus.ACCEPTED })
    status1: RelationshipStatus;

    @IsEnum(RelationshipStatus)
    @Column({ type: 'enum', enum: RelationshipStatus, default: RelationshipStatus.PENDING })
    status2: RelationshipStatus;

    @ManyToOne(() => User, user => user.relationships, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user1Id' })
    user1: User;
  
    @ManyToOne(() => User, user => user.relationships, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user2Id' })
    user2: User;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    /* Helper Functions */

    @BeforeInsert()
    @BeforeUpdate()
    cannotSelfRelationship(): void  {
        if (this.user1?.id == this.user2?.id) {
            throw new BadRequestException('Cannot build a relationship with yourself');
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    reorderUsers(): void  {
        if (this.user1.id > this.user2.id) {
            this.setRelationshipStatusDefaults();
            this.swapUsers();
        }
    }

    private swapUsers(): void {
        [this.user1, this.user2] = [this.user2, this.user1];
        [this.status1, this.status2] = [this.status2, this.status1];     
    }

    private setRelationshipStatusDefaults(): void {
        this.status1 = this.status1 || RelationshipStatus.ACCEPTED;
        this.status2 = this.status2 || RelationshipStatus.PENDING;
    }

    setStatus(userId: number, status: RelationshipStatus): void {
        if (this.user1?.id == userId) this.status1 = status;
        else if (this.user2?.id == userId) this.status2 = status;
    }

}