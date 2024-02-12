import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResult } from 'src/gamelogs/dtos/UserResult.dto';
import { Gamelog } from 'src/gamelogs/entities/Gamelog.entity';
import { GameResult, GamelogToUser } from 'src/gamelogs/entities/GamelogToUser.entity';
import { CreateGamelogParams, ReplaceGamelogParams, UpdateGamelogParams } from 'src/gamelogs/types/gamelogs.type';
import { User } from 'src/users/entities/User.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class GamelogsService {

    constructor(
        @InjectRepository(Gamelog)
        private readonly gamelogRepository: Repository<Gamelog>,
        @InjectRepository(GamelogToUser)
        private readonly gamelogToUserRepository: Repository<GamelogToUser>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getGamelogs(): Promise<Gamelog[]> {
        // Public

        return (await this.gamelogRepository.find({
            relations: ['gamelogToUsers.user'],
        }));
    }

    async getUserGamelogs(userId: number): Promise<{ gamelogs: Gamelog[]; userResultCounts: Record<GameResult, number> }> {
        // Public

        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['userToGamelogs.gamelog.gamelogToUsers.user'],
        });
    
        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    
        const gamelogs = user.userToGamelogs.map((userToGamelog) => userToGamelog.gamelog);

        const userResultCounts: Record<GameResult, number> = {} as Record<GameResult, number>;
        Object.values(GameResult).forEach((result) => { userResultCounts[result] = 0 });

        gamelogs.forEach((gamelog) => {
            gamelog.gamelogToUsers
                .filter((gamelogToUser) => gamelogToUser.user.id == userId)
                .forEach((gamelogToUser) => {
                    userResultCounts[gamelogToUser.result]++;
                });
        });

        return ({ userResultCounts, gamelogs });
    }

    async createGamelog(gamelogDetails: CreateGamelogParams): Promise<Gamelog> {
        // Only the server should be autorized to access this.

        const gamelogToUsers = await this.createGamelogToUsers(gamelogDetails.userResults, null);
        delete gamelogDetails.userResults;

        const gamelog = this.gamelogRepository.create({
            ...gamelogDetails,
            gamelogToUsers,
        });

        return (await this.gamelogRepository.save(gamelog));
    }

    async replaceGamelog(gamelogId: number, gamelogDetails: ReplaceGamelogParams): Promise<Gamelog> {
        // Only the server should be autorized to access this.

        const gamelog = await this.gamelogRepository.findOne({
            where: { id: gamelogId },
            relations: ['gamelogToUsers.user'],
        });

        if (!gamelog) throw new NotFoundException(`Gamelog with ID ${gamelogId} not found`);

        const gamelogToUsers = await this.createGamelogToUsers(gamelogDetails.userResults, gamelog);
        delete gamelogDetails.userResults;

        return (await this.gamelogRepository.save({
            ...gamelog,
            ...gamelogDetails,
            gamelogToUsers,
        }));
    }

    async updateGamelog(gamelogId: number, gamelogDetails: UpdateGamelogParams): Promise<Gamelog> {
        // Only the server should be autorized to access this.

        const gamelog = await this.gamelogRepository.findOne({
            where: { id: gamelogId },
            relations: ['gamelogToUsers.user'],
        });

        if (!gamelog) throw new NotFoundException(`Gamelog with ID ${gamelogId} not found`);

        const gamelogToUsers = await this.createGamelogToUsers(gamelogDetails.userResults, gamelog);
        delete gamelogDetails.userResults;

        return (await this.gamelogRepository.save({
            ...gamelog,
            ...gamelogDetails,
            gamelogToUsers,
        }));
    }

    async deleteGamelog(gamelogId: number): Promise<string> {
        // verify user permissions. You shouldn't be able to delete. Maybe hide your name ?

        await this.gamelogRepository.delete(gamelogId);
        return (`Gamelog with ID ${gamelogId} successfully deleted`);
    }

    /* Helper Functions */

    private async createGamelogToUsers(userResults: UserResult[], gamelog: Gamelog): Promise<GamelogToUser[]> {
        const userIds = userResults.map((userResult) => userResult.id);

        if (userIds.length !== new Set(userIds).size) {
            const duplicateUserIds = userIds.filter((id, index) => userIds.indexOf(id) !== index);
            const errMessage = duplicateUserIds.length > 1 ? `Following user IDs are duplicate: ${duplicateUserIds}` : `Following user ID is duplicate: ${duplicateUserIds}`;
            throw new BadRequestException(errMessage);
        }

        const users = await this.userRepository.find({
            where: { id: In(userIds) },
        });

        if (users.length !== userIds.length) {
            const missingUserIds = userIds.filter((id) => !users.some((user) => user.id == id));
            const errMessage = missingUserIds.length > 1 ? `Following users not found : ${missingUserIds}` : `Following user not found : ${missingUserIds}`;
            throw new NotFoundException(errMessage);
        }

        const gamelogToUsers = userResults.map((userResult) => {
            const existingGtu = gamelog?.gamelogToUsers.find((gamelogToUser) => gamelogToUser.user?.id == userResult.id);

            return (existingGtu ? {
                ...existingGtu,
                result: userResult.result,
            } : this.gamelogToUserRepository.create({
                ...userResult,
                user: users.find((user) => user.id == userResult.id),
            }));
        });

        return (gamelogToUsers);
    }

}
