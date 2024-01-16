import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friendship } from 'src/friendships/entities/Friendships';
import { CreateFriendshipParams, UpdateFriendshipParams } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class FriendshipsService {

    constructor(
        @InjectRepository(Friendship)
        private readonly friendshipRepository: Repository<Friendship>,
    ) {}

    async getUserFriendships(userId: number): Promise<Friendship[]> {
        const friendships = await this.friendshipRepository.find({
            where: [
                { user1: { id: userId } },
                { user2: { id: userId } },
            ],
            relations: ['user1', 'user2'],
        });

        if (friendships.length === 0) {
            throw new NotFoundException(`No friendships found for User ID ${userId}`);
        }

        return (friendships);
    }

    async getUserFriendshipByUserId(userId: number, targetUserId: number): Promise<Friendship> {
        if (userId === targetUserId) {
            throw new ConflictException('You cannot perform this action on yourself');
        }

        const friendship = await this.friendshipRepository.findOne({
            where: [
                { user1: { id: userId }, user2: { id: targetUserId } },
                { user1: { id: targetUserId }, user2: { id: userId } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!friendship) {
            throw new NotFoundException(`No friendship found with User ID ${targetUserId}`);
        }

        return (friendship);
    }

    async createUserFriendship(userId: number, friendshipDetails: CreateFriendshipParams): Promise<Friendship> {
        const newFriendship = this.friendshipRepository.create({
            user1: { id: userId },
            user2: { id: friendshipDetails.targetId },
            ...friendshipDetails,
        });

        return (await this.friendshipRepository.save(newFriendship));
    }

    async replaceUserFriendship(userId: number, targetId: number, friendshipDetails: UpdateFriendshipParams): Promise<Friendship> {
        if (userId === targetId) {
            throw new ConflictException('You cannot perform this action on yourself');
        }

        const friendship = await this.friendshipRepository.findOne({
            where: [
                { user1: { id: userId }, user2: { id: targetId } },
                { user1: { id: targetId }, user2: { id: userId } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!friendship) {
            throw new NotFoundException(`No friendship found with User ID ${targetId}`);
        }

        friendship.setStatus(userId, friendshipDetails.status);

        return (await this.friendshipRepository.save(friendship));
    }

    async updateUserFriendship(userId: number, targetId: number, friendshipDetails: UpdateFriendshipParams): Promise<Friendship> {
        if (userId === targetId) {
            throw new ConflictException('You cannot perform this action on yourself');
        }

        const friendship = await this.friendshipRepository.findOne({
            where: [
                { user1: { id: userId }, user2: { id: targetId } },
                { user1: { id: targetId }, user2: { id: userId } },
            ],
            relations: ['user1', 'user2'],
        });

        if (!friendship) {
            throw new NotFoundException(`No friendship found with User ID ${targetId}`);
        }

        friendship.setStatus(userId, friendshipDetails.status);

        return (await this.friendshipRepository.save(friendship));
    }

}
