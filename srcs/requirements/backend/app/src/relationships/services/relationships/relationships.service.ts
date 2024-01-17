import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Relationship } from 'src/relationships/entities/Relationship';
import { CreateRelationshipParams, ReplaceRelationshipParams, UpdateRelationshipParams } from 'src/relationships/types/relationship.type';
import { User } from 'src/users/entities/User';
import { Repository } from 'typeorm';

@Injectable()
export class RelationshipsService {

    constructor(
        @InjectRepository(Relationship)
        private readonly relationshipRepository: Repository<Relationship>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getUserRelationships(userId: number): Promise<Relationship[]> {
        const relationships = await this.relationshipRepository.find({
            where: [
                { user1: { id: userId } },
                { user2: { id: userId } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!relationships || relationships.length === 0) throw new NotFoundException(`No Relationships found for User with ID ${userId}`);

        return (relationships);
    }

    async getUserRelationship(userId: number, targetId: number): Promise<Relationship> {
        return (await this.findRelationship(userId, targetId));
    }

    async createUserRelationship(userId: number, relationshipDetails: CreateRelationshipParams): Promise<Relationship> {
        const newRelationship = this.relationshipRepository.create({
            user1: { id: userId },
            user2: { id: relationshipDetails.targetId },
            ...relationshipDetails,
        });

        return (await this.relationshipRepository.save(newRelationship));        
    }

    async replaceUserRelationship(
        userId: number,
        targetId: number,
        relationshipDetails: ReplaceRelationshipParams
    ): Promise<Relationship> {
        const relationship = await this.findRelationship(userId, targetId);

        console.log(relationship);

        relationship.setStatus(userId, relationshipDetails.status);

        return (await this.relationshipRepository.save({
            ...relationship,
            ...relationshipDetails,
        }));
    }

    async updateUserRelationship(
        userId: number,
        targetId: number,
        relationshipDetails: UpdateRelationshipParams
    ): Promise<Relationship> {
        const relationship = await this.findRelationship(userId, targetId);

         if (!relationship) throw new NotFoundException(`Relationship between user with ID ${userId} and user with ID ${targetId} not found`);

        console.log(relationship);

        relationship.setStatus(userId, relationshipDetails.status);

        return (await this.relationshipRepository.save({
            ...relationship,
            ...relationshipDetails,
        }));
    }

    async deleteRelationship(userId: number, targetId: number): Promise<string> {
        const relationship = await this.findRelationship(userId, targetId);
        await this.relationshipRepository.remove(relationship);

        return (`Relationship between user with ID ${userId} and user with ID ${targetId} successfully deleted`);
    }


    /* Helper Methods */


    private async findRelationship(userId: number, targetId: number): Promise<Relationship> {
        const relationship = await this.relationshipRepository.findOne({
            where: [
                { user1: { id: userId }, user2: { id: targetId }, },
                { user1: { id: targetId }, user2: { id: userId }, },
            ],
             relations: ['user1', 'user2'],
         });

         console.log(relationship);

         if (!relationship) throw new NotFoundException(`Relationship between user with ID ${userId} and user with ID ${targetId} not found`);

        return (relationship);
    }

}
