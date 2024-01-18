import { BadRequestException } from "@nestjs/common";
import { User } from "src/users/entities/User";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'relationships' })
export class Relationship {

    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @ManyToMany(() => User, (user) => user.relationships)
    users?: User[];

    /* Helper Functions */

    @BeforeInsert()
    @BeforeUpdate()
    checkRelationship(): void {
        this.preventSelfRelationship();
        this.reorderElements();
    }

    private reorderElements(): void {
        this.users.sort((a, b) => a.id - b.id);
    }

    private preventSelfRelationship(): void {
        if (this.users.length <= 1) throw new BadRequestException('A relationship needs at least two different users');
    }

}