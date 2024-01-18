import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Relationship } from 'src/relationships/entities/Relationship';
import { CreateRelationshipParams, ReplaceRelationshipParams, UpdateRelationshipParams } from 'src/relationships/types/relationship.type';
import { User } from 'src/users/entities/User';
import { In, Like, Relation, Repository } from 'typeorm';

@Injectable()
export class RelationshipsService {

    constructor(
        @InjectRepository(Relationship)
        private readonly relationshipRepository: Repository<Relationship>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getUserRelationships(userId: number): Promise<Relationship[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['relationships', 'relationships.users'],
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        return (user.relationships);
    }

    async getUserRelationship(userId: number, targetId: number): Promise<Relationship> {
        const relationship = await this.findRelationship([userId, targetId]);

        if (!relationship) throw new NotFoundException(`Relationship between given users (${[userId, targetId]}) not found`);

        return (relationship);
    }

    async createUserRelationship(userId: number, relationshipDetails: CreateRelationshipParams): Promise<Relationship> {
        const userIds = [userId, relationshipDetails.targetId];
        const existingRelationship = await this.findRelationship(userIds);

        if (existingRelationship) throw new NotFoundException(`Relationship between given users (${userIds}) already exists`);

        const newRelationship = this.relationshipRepository.create({
            users: [{ id: userId }, { id: relationshipDetails.targetId }],
            ...relationshipDetails,
        });

        return (await this.relationshipRepository.save(newRelationship));
    }

    async replaceUserRelationship(
        userId: number,
        targetId: number,
        relationshipDetails: ReplaceRelationshipParams
    ): Promise<Relationship> {
        const existingRelationship = await this.findRelationship([userId, targetId]);

        if (!existingRelationship) throw new NotFoundException(`Relationship between given users (${[userId, targetId]}) not found`);

        return (await this.relationshipRepository.save({
            ...existingRelationship,
            ...relationshipDetails,
        }));
    }

    async updateUserRelationship(
        userId: number,
        targetId: number,
        relationshipDetails: UpdateRelationshipParams
    ): Promise<Relationship> {
        const existingRelationship = await this.findRelationship([userId, targetId]);

        if (!existingRelationship) throw new NotFoundException(`Relationship between given users (${[userId, targetId]}) not found`);

        return (await this.relationshipRepository.save({
            ...existingRelationship,
            ...relationshipDetails,
        }));
    }

    async deleteRelationship(userId: number, targetId: number): Promise<string> {
        return (null);
    }

    /* Helper Functions */

    private async findRelationship(userIds: number[]): Promise <Relationship> {
        const relationship = await this.relationshipRepository.findOne({
            where: {
                users: {
                    id: In(userIds),
                }
            },
            relations: ['users'],
        });

        if (!relationship || relationship.users.length !== userIds.length) return (null);

        return (relationship);
    }

}
