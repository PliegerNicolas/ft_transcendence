import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResult } from 'src/gamelogs/dtos/UserResult.dto';
import { Gamelog } from 'src/gamelogs/entities/Gamelog.entity';
import { GameResult, GamelogToUser } from 'src/gamelogs/entities/GamelogToUser.entity';
import { CreateGamelogParams, ReplaceGamelogParams, UpdateGamelogParams } from 'src/gamelogs/types/gamelogs.type';
import { User } from 'src/users/entities/User.entity';
import { Equal, In, Repository } from 'typeorm';

@Injectable()
export class GamelogsService {

    // To verify. It seems to work after changing ids as usernames

    constructor(
        @InjectRepository(Gamelog)
        private readonly gamelogRepository: Repository<Gamelog>,
        @InjectRepository(GamelogToUser)
        private readonly gamelogToUserRepository: Repository<GamelogToUser>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getAllGamelogs(): Promise<Gamelog[]> {
        return (await this.gamelogRepository.find({
            relations: ['gamelogToUsers.user'],
        }));
    }

    async getGamelog(gamelogId: bigint = undefined): Promise<Gamelog> {
        const gamelog = await this.gamelogRepository.findOne({
            where: { id: gamelogId },
            relations: ['gamelogToUsers.user'],
        });

        if (!gamelog) throw new NotFoundException(`Gamelog with ID ${gamelogId} not found`);

        return (gamelog);
    }

    async getUserGamelogs(username: string = undefined): Promise<{ gamelogs: Gamelog[]; userResultsCount: Record<GameResult, number> }> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: ['userToGamelogs.gamelog.gamelogToUsers.user'],
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        const gamelogs = user.userToGamelogs.map((userToGamelog) => userToGamelog.gamelog);
        const userResultsCount = this.countUserResults(username, gamelogs);

        return ({ gamelogs, userResultsCount });
    }

    /* Helper Functions */

    private countUserResults(username: string, gamelogs: Gamelog[]): Record<GameResult, number> {
        const userResultsCount: Record<GameResult, number> = {} as Record<GameResult, number>;
        Object.values(GameResult).forEach((result) => { userResultsCount[result] = 0 });

        gamelogs.forEach((gamelog) => {
            gamelog.gamelogToUsers
                .filter((gamelogToUser) => gamelogToUser.user.username === username)
                .forEach((gamelogToUser) => { userResultsCount[gamelogToUser.result]++; });
        });

        return (userResultsCount);
    }

    /*
    async getGamelogs(): Promise<Gamelog[]> {
        // Public

        return (await this.gamelogRepository.find({
            relations: ['gamelogToUsers.user'],
        }));
    }

    async getUserGamelogs(username: string): Promise<{ gamelogs: Gamelog[]; userResultCounts: Record<GameResult, number> }> {
        // Public

        const user = await this.userRepository.findOne({
            where: { username: username },
            relations: ['userToGamelogs.gamelog.gamelogToUsers.user'],
        });
    
        if (!user) throw new NotFoundException(`User with Username '${username}' not found`);
    
        const gamelogs = user.userToGamelogs.map((userToGamelog) => userToGamelog.gamelog);

        const userResultCounts: Record<GameResult, number> = {} as Record<GameResult, number>;
        Object.values(GameResult).forEach((result) => { userResultCounts[result] = 0 });

        gamelogs.forEach((gamelog) => {
            gamelog.gamelogToUsers
                .filter((gamelogToUser) => gamelogToUser.user.username === username)
                .forEach((gamelogToUser) => {
                    userResultCounts[gamelogToUser.result]++;
                });
        });

        return ({ userResultCounts, gamelogs });
    }

    async createGamelog(gamelogDetails: CreateGamelogParams): Promise<Gamelog> {
        // Only the server should be autorized to access this.
        // How to verify this ? Dunno yet.

        const gamelogToUsers = await this.createGamelogToUsers(gamelogDetails.userResults, null);
        delete gamelogDetails.userResults;

        const gamelog = this.gamelogRepository.create({
            ...gamelogDetails,
            gamelogToUsers,
        });

        return (await this.gamelogRepository.save(gamelog));
    }

    async replaceGamelog(gamelogId: bigint, gamelogDetails: ReplaceGamelogParams): Promise<Gamelog> {
        // Only the server should be autorized to access this.
        // How to verify this ? Dunno yet.

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

    async updateGamelog(gamelogId: bigint, gamelogDetails: UpdateGamelogParams): Promise<Gamelog> {
        // Only the server should be autorized to access this.
        // How to verify this ? Dunno yet.

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

    async deleteGamelog(gamelogId: bigint): Promise<string> {
        // verify user permissions. You shouldn't be able to delete a gamelog. Maybe hide your name / soft delete ?
        // How to verify this ? Dunno yet.

        const gamelog = await this.gamelogRepository.findOne({
            where: { id: gamelogId },
        });

        if (!gamelog) throw new NotFoundException(`Gamelog with ID ${gamelogId} not found`);

        await this.gamelogRepository.remove(gamelog);
        return (`Gamelog with ID ${gamelogId} successfully deleted`);
    }

    /* Helper Functions */

    /*
    private async createGamelogToUsers(userResults: UserResult[], gamelog: Gamelog): Promise<GamelogToUser[]> {
        const usernames = userResults.map((userResult) => userResult.username);

        if (usernames.length !== new Set(usernames).size) {
            const duplicateUsernames = usernames.filter((username, index) => usernames.indexOf(username) !== index);
            const errMessage = duplicateUsernames.length > 1 ? `Following user IDs are duplicate: ${duplicateUsernames}` : `Following user ID is duplicate: ${duplicateUsernames}`;
            throw new BadRequestException(errMessage);
        }

        const users = await this.userRepository.find({
            where: { username: In(usernames) },
        });

        if (users.length !== usernames.length) {
            const missingUsernames = usernames.filter((username) => !users.some((user) => user.username === username));
            const errMessage = missingUsernames.length > 1 ? `Following users not found : ${missingUsernames}` : `Following user not found : ${missingUsernames}`;
            throw new NotFoundException(errMessage);
        }

        const gamelogToUsers = userResults.map((userResult) => {
            const existingGtu = gamelog?.gamelogToUsers.find((gamelogToUser) => gamelogToUser.user?.username === userResult.username);

            return (existingGtu ? {
                ...existingGtu,
                result: userResult.result,
            } : this.gamelogToUserRepository.create({
                ...userResult,
                user: users.find((user) => user.username === userResult.username),
            }));
        });

        return (gamelogToUsers);
    }
    */

}
