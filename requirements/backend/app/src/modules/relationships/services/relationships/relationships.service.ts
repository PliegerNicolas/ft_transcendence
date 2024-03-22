import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Relationship } from "../../entities/Relationship.entity";
import { Equal, Repository } from "typeorm";
import { User } from "../../../users/entities/User.entity";
import { CreateRelationshipParams, ReplaceRelationshipParams, UpdateRelationshipParams } from "../../types/relationship.type";

@Injectable()
export class RelationshipsService {

    constructor(
        @InjectRepository(Relationship)
        private readonly relationshipRepository: Repository<Relationship>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getRelationships(username: string = undefined): Promise<Relationship[]> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: [
                'relationships1.user1', 'relationships1.user2',
                'relationships2.user1', 'relationships2.user2'
            ],
        });

        if (!user) throw new NotFoundException(`User '${username} not found`);

        return (user.relationships);
    }

    async getRelationship(username: string = undefined, targetUsername: string = undefined): Promise<Relationship> {
        const relationship = await this.relationshipRepository.findOne({
            where: [
                { user1: { username: Equal(username) }, user2: { username: Equal(targetUsername) } },
                { user1: { username: Equal(targetUsername) }, user2: { username: Equal(username) } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!relationship) throw new NotFoundException(`Relationship between User '${username ? username : '{undefined}' }' and '${targetUsername ? targetUsername : '{undefined}' }' not found`);

        return (relationship);
    }

    async createRelationship(username: string = undefined, relationshipDetails: CreateRelationshipParams): Promise <Relationship> {
        const targetUsername = relationshipDetails.username;

        let relationship = await this.relationshipRepository.findOne({
            where: [
                { user1: { username: Equal(username) }, user2: { username: Equal(targetUsername) } },
                { user1: { username: Equal(targetUsername) }, user2: { username: Equal(username) } },
            ],
            relations: ['user1', 'user2'],
        });

        if (relationship) throw new NotFoundException(`Relationship between User '${username ? username : '{undefined}' }' and '${targetUsername ? targetUsername : '{undefined}' }' already exists`);

        const [user1, user2] = await Promise.all([
            this.userRepository.findOne({ where: { username: Equal(username) } }),
            this.userRepository.findOne({ where: { username: Equal(targetUsername) } }),
        ]);

        const missingUsers = [user1, user2]
            .map((user, i) => user ? undefined : [username, targetUsername][i] ?? '{undefined}')
            .filter((user) => user !== undefined);
        if (missingUsers.length > 0) throw new NotFoundException(`User${missingUsers.length > 1 ? 's' : ''} '${missingUsers.join("' and '")}' not found`);

        relationship = this.relationshipRepository.create({
            user1: user1,
            user2: user2,
        });

        relationship.setStatusOnCreation(relationshipDetails.status);

        return (await this.relationshipRepository.save(relationship));
    }

    async replaceRelationship(username: string = undefined, targetUsername: string = undefined, relationshipDetails: ReplaceRelationshipParams): Promise <Relationship> {
        const relationship = await this.relationshipRepository.findOne({
            where: [
                { user1: { username: Equal(username) }, user2: { username: Equal(targetUsername) } },
                { user1: { username: Equal(targetUsername) }, user2: { username: Equal(username) } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!relationship) throw new NotFoundException(`Relationship between User '${username ? username : '{undefined}' }' and '${targetUsername ? targetUsername : '{undefined}' }' not found`);

        relationship.setStatusByUsername(username, relationshipDetails.status);

        return (await this.relationshipRepository.save(relationship));
    }

    async updateRelationship(username: string = undefined, targetUsername: string = undefined, relationshipDetails: UpdateRelationshipParams): Promise <Relationship> {
        const relationship = await this.relationshipRepository.findOne({
            where: [
                { user1: { username: Equal(username) }, user2: { username: Equal(targetUsername) } },
                { user1: { username: Equal(targetUsername) }, user2: { username: Equal(username) } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!relationship) throw new NotFoundException(`Relationship between User '${username ? username : '{undefined}' }' and '${targetUsername ? targetUsername : '{undefined}' }' not found`);

        relationship.setStatusByUsername(username, relationshipDetails.status);

        return (await this.relationshipRepository.save(relationship));
    }

    async deleteRelationship(username: string = undefined, targetUsername: string = undefined): Promise<string> {
        const relationship = await this.relationshipRepository.findOne({
            where: [
                { user1: { username: Equal(username) }, user2: { username: Equal(targetUsername) } },
                { user1: { username: Equal(targetUsername) }, user2: { username: Equal(username) } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!relationship) throw new NotFoundException(`Relationship between User '${username ? username : '{undefined}' }' and '${targetUsername ? targetUsername : '{undefined}' }' not found`);

        relationship.isDeletionPermitted(username);

        await this.relationshipRepository.remove(relationship);
        return (`Relationship between User '${username ? username : '{undefined}' }' and '${targetUsername ? targetUsername : '{undefined}' }' successfully deleted`);

    }

}
