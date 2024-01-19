import { BadRequestException } from "@nestjs/common";
import { IsEnum } from "class-validator";
import { User } from "src/users/entities/User";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

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

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @ManyToOne(() => User, (user) => user.relationships1, { onDelete: 'CASCADE' })
    user1: User;

    @ManyToOne(() => User, (user) => user.relationships2, { onDelete: 'CASCADE' })
    user2: User;

    @IsEnum(RelationshipStatus)
    @Column({ type: 'enum', enum: RelationshipStatus, default: RelationshipStatus.ACCEPTED })
    status1: RelationshipStatus;

    @IsEnum(RelationshipStatus)
    @Column({ type: 'enum', enum: RelationshipStatus, default: RelationshipStatus.PENDING })
    status2: RelationshipStatus;

    /* Helper Functions */

    @BeforeInsert()
    @BeforeUpdate()
    initializeRelationship(): void {
        this.preventSelfRelationship();
        this.initializeStatuses();
        this.reorderElements();
    }

    private preventSelfRelationship(): void {
        if (this.user1.id === this.user2.id) throw new BadRequestException('You cannot create a relationship with yourself');
    }

    private initializeStatuses(): void {
        if (!this.status1) this.status1 = RelationshipStatus.ACCEPTED;
        if (!this.status2) this.status2 = RelationshipStatus.PENDING;
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

    setStatusById(id: number, status: RelationshipStatus): void {
        if (this.user1.id == id) this.status1 = status;
        else if (this.user2.id == id) this.status2 = status;
    }

}