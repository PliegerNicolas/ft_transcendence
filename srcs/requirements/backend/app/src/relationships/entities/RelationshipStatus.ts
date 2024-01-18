import { BadRequestException } from "@nestjs/common";
import { IsEnum } from "class-validator";
import { User } from "src/users/entities/User";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

export enum RelationshipStatusEnum {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
    BLOCKED = 'blocked',
}

@Entity({ name: 'relationship_status' })
export class RelationshipStatus {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

}