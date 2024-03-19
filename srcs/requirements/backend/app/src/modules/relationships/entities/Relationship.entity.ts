import { BadRequestException } from "@nestjs/common";
import { IsEnum } from "class-validator";
import { User } from "../../users/entities/User.entity";
import { AfterLoad, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { RelationshipStatus } from "../enums/relationship-status.enum";
import { UserStatus } from "../types/relationship.type";
import { Exclude } from "class-transformer";

@Entity({ name: 'relationships' })
@Unique(['user1', 'user2'])
export class Relationship {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: bigint;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @Exclude()
    @ManyToOne(() => User, (user) => user.relationships1, { onDelete: 'CASCADE' })
    user1: User;

    @Exclude()
    @ManyToOne(() => User, (user) => user.relationships2, { onDelete: 'CASCADE' })
    user2: User;

    @Exclude()
    @IsEnum(RelationshipStatus)
    @Column({ type: 'enum', enum: RelationshipStatus, default: RelationshipStatus.UNDEFINED })
    status1: RelationshipStatus;

    @Exclude()
    @IsEnum(RelationshipStatus)
    @Column({ type: 'enum', enum: RelationshipStatus, default: RelationshipStatus.UNDEFINED })
    status2: RelationshipStatus;

    userStatuses: UserStatus[];

    /* Helper Functions */

    @AfterLoad()
    setUserStatus(): void {
        this.userStatuses = [];
        this.userStatuses.push({ user: this.user1, status: this.status1 });
        this.userStatuses.push({ user: this.user2, status: this.status2 });
    }


    @BeforeInsert()
    @BeforeUpdate()
    initializeRelationship(): void {
        this.preventSelfRelationship();
        this.reorderElements();
    }

    private preventSelfRelationship(): void {
        if (this.user1.username === this.user2.username) throw new BadRequestException('You cannot create a relationship with yourself');
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

    setStatusByUsername(username: string, status: RelationshipStatus): void {
        if (this.user1.username === username) this.status1 = status;
        else if (this.user2.username === username) this.status2 = status;
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

    isDeletionPermitted(username: string): void {
        const isBlockedOrDeclined = [RelationshipStatus.BLOCKED, RelationshipStatus.DECLINED];

        switch (true) {
            case (username === this.user1.username): {
                if (isBlockedOrDeclined.includes(this.status2)) {
                    throw new BadRequestException(`Relationship cannot be deleted due to counterpart's status (${this.status2})`);
                }
                break ;
            }
            case (username === this.user2.username): {
                if (isBlockedOrDeclined.includes(this.status1)) {
                    throw new BadRequestException(`Relationship cannot be deleted due to counterpart's status (${this.status1})`);
                }
                break ;
            }
            default: {
                throw new BadRequestException(`User with Username ${username} isn't concerned by this relationship`);
            }
        }
    }

}