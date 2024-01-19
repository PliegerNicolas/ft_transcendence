import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: [
                'relationships1.user1', 'relationships1.user2',
                'relationships2.user1', 'relationships2.user2',
            ],
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        return (user.getRelationships());
    }

    async getUserRelationship(userId: number, targetId: number): Promise<Relationship> {
        const relationship = await this.relationshipRepository.findOne({
            where: [
                { user1: { id: userId }, user2: { id: targetId } },
                { user1: { id: targetId }, user2: { id: userId } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!relationship) throw new NotFoundException(`Relationship between given users (${[userId, targetId]}) not found`);

        return (relationship);
    }

    async createUserRelationship(userId: number, relationshipDetails: CreateRelationshipParams): Promise<Relationship> {
        const newRelationship = this.relationshipRepository.create({
            user1: { id: userId },
            user2: { id: relationshipDetails.targetId },
        });

        newRelationship.setStatusOnCreation(relationshipDetails.status);

        return (await this.relationshipRepository.save(newRelationship));
    }

    async replaceUserRelationship(
        userId: number,
        targetId: number,
        relationshipDetails: ReplaceRelationshipParams
    ): Promise<Relationship> {
        const relationship = await this.relationshipRepository.findOne({
            where: [
                { user1: { id: userId }, user2: { id: targetId } },
                { user1: { id: targetId }, user2: { id: userId } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!relationship) throw new NotFoundException(`Relationship between given users (${[userId, targetId]}) not found`);

        relationship.setStatusById(userId, relationshipDetails.status);

        return (await this.relationshipRepository.save(relationship));
    }

    async updateUserRelationship(
        userId: number,
        targetId: number,
        relationshipDetails: UpdateRelationshipParams
    ): Promise<Relationship> {
        const relationship = await this.relationshipRepository.findOne({
            where: [
                { user1: { id: userId }, user2: { id: targetId } },
                { user1: { id: targetId }, user2: { id: userId } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!relationship) throw new NotFoundException(`Relationship between given users (${[userId, targetId]}) not found`);

        relationship.setStatusById(userId, relationshipDetails.status);

        return (await this.relationshipRepository.save(relationship));
    }

    async deleteRelationship(userId: number, targetId: number): Promise<string> {
        const relationship = await this.relationshipRepository.findOne({
            where: [
                { user1: { id: userId }, user2: { id: targetId } },
                { user1: { id: targetId }, user2: { id: userId } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!relationship) throw new NotFoundException(`Relationship between given users (${[userId, targetId]}) not found`);

        relationship.isDeletionPermitted(userId);

        await this.relationshipRepository.remove(relationship);
        return (`Relationship between Users with IDs ${[userId, targetId]} successfully deleted`);

    }

}
