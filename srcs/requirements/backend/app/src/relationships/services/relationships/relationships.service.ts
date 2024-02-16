import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Relationship } from 'src/relationships/entities/Relationship.entity';
import { CreateRelationshipParams, ReplaceRelationshipParams, UpdateRelationshipParams } from 'src/relationships/types/relationship.type';
import { User } from 'src/users/entities/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RelationshipsService {

    constructor(
        @InjectRepository(Relationship)
        private readonly relationshipRepository: Repository<Relationship>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getUserRelationships(username: string): Promise<Relationship[]> {
        const user = await this.userRepository.findOne({
            where: { username: username },
            relations: [
                'relationships1.user1', 'relationships1.user2',
                'relationships2.user1', 'relationships2.user2',
            ],
        });

        if (!user) throw new NotFoundException(`User with Username '${username}' not found`);

        return (user.getRelationships());
    }

    async getUserRelationship(username: string, targetUsername: string): Promise<Relationship> {
        const relationship = await this.relationshipRepository.findOne({
            where: [
                { user1: { username: username }, user2: { username: targetUsername } },
                { user1: { username: targetUsername }, user2: { username: username } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!relationship) throw new NotFoundException(`Relationship between given users (${[username, targetUsername]}) not found`);

        return (relationship);
    }

    async createUserRelationship(username: string, relationshipDetails: CreateRelationshipParams): Promise<Relationship> {
        let relationship = await this.relationshipRepository.findOne({
            where: [
                { user1: { username: username }, user2: { username: relationshipDetails.username } },
                { user1: { username: relationshipDetails.username }, user2: { username: username } },
            ],
        });

        if (relationship) throw new ConflictException(`Relationship between ${[username, relationshipDetails.username]} already exists`);

        const [user1, user2] = await Promise.all([
            this.userRepository.findOne({ where: { username: username } }),
            this.userRepository.findOne({ where: { username: relationshipDetails.username } }),
        ]);

        if (!user1 || !user2) {
            const missingUsers = [];
            if (!user1) missingUsers.push(username);
            if (!user2) missingUsers.push(relationshipDetails.username);
            if (missingUsers.length > 1) throw new NotFoundException(`Users with Usernames '${missingUsers}' not found`);
            else throw new NotFoundException(`User with Username '${missingUsers}' not found`);
        }

        relationship = this.relationshipRepository.create({
            user1,
            user2
        });

        relationship.setStatusOnCreation(relationshipDetails.status);

        return (await this.relationshipRepository.save(relationship));
    }

    async replaceUserRelationship(
        username: string,
        targetUsername: string,
        relationshipDetails: ReplaceRelationshipParams
    ): Promise<Relationship> {
        const relationship = await this.relationshipRepository.findOne({
            where: [
                { user1: { username: username }, user2: { username: targetUsername } },
                { user1: { username: targetUsername }, user2: { username: username } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!relationship) throw new NotFoundException(`Relationship between Users with Usernammes (${[username, targetUsername]}) not found`);

        relationship.setStatusByUsername(username, relationshipDetails.status);

        return (await this.relationshipRepository.save(relationship));
    }

    async updateUserRelationship(
        username: string,
        targetUsername: string,
        relationshipDetails: UpdateRelationshipParams
    ): Promise<Relationship> {
        const relationship = await this.relationshipRepository.findOne({
            where: [
                { user1: { username: username }, user2: { username: targetUsername } },
                { user1: { username: targetUsername }, user2: { username: username } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!relationship) throw new NotFoundException(`Relationship between Users with Usernammes (${[username, targetUsername]}) not found`);

        relationship.setStatusByUsername(username, relationshipDetails.status);

        return (await this.relationshipRepository.save(relationship));
    }

    async deleteRelationship(username: string, targetUsername: string): Promise<string> {
        const relationship = await this.relationshipRepository.findOne({
            where: [
                { user1: { username: username }, user2: { username: targetUsername } },
                { user1: { username: targetUsername }, user2: { username: username } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!relationship) throw new NotFoundException(`Relationship between Users with Usernammes (${[username, targetUsername]}) not found`);

        relationship.isDeletionPermitted(username);

        await this.relationshipRepository.remove(relationship);
        return (`Relationship between Users with Usernames ${[username, targetUsername]} successfully deleted`);

    }

}
