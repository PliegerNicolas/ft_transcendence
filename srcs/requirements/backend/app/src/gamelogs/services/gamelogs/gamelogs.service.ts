import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResultWithUser, UserResultWithUsername } from 'src/gamelogs/dtos/UserResult.dto';
import { Gamelog } from 'src/gamelogs/entities/Gamelog.entity';
import { GameResult, GamelogToUser } from 'src/gamelogs/entities/GamelogToUser.entity';
import { CreateGamelogParams, ReplaceGamelogParams, UpdateGamelogParams } from 'src/gamelogs/types/gamelogs.type';
import { User } from 'src/users/entities/User.entity';
import { Equal, In, Repository } from 'typeorm';

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

    async createGamelog(gamelogDetails: CreateGamelogParams): Promise<Gamelog> {
        const gamelogToUsers = await this.createOrUpdateGamelogToUsers(gamelogDetails.userResults, undefined)
            .finally(() => delete gamelogDetails.userResults);

        const gamelog = this.gamelogRepository.create({
            ...gamelogDetails,
            gamelogToUsers: gamelogToUsers,
        })

        return (await this.gamelogRepository.save(gamelog));
    }

    async replaceGamelog(gamelogId: bigint = undefined, gamelogDetails: ReplaceGamelogParams): Promise<Gamelog> {
        const gamelog = await this.gamelogRepository.findOne({
            where: {  id: Equal(gamelogId) },
            relations: ['gamelogToUsers.user'],
        });

        if (!gamelog) throw new NotFoundException(`Gamelog with ID ${gamelogId} not found`);

        const gamelogToUsers = await this.createOrUpdateGamelogToUsers(gamelogDetails.userResults, gamelog)
            .finally(() => delete gamelogDetails.userResults);

        return (await this.gamelogRepository.save({
            ...gamelog,
            ...gamelogDetails,
            gamelogToUsers: gamelogToUsers,
        }));
    }

    async updateGamelog(gamelogId: bigint = undefined, gamelogDetails: UpdateGamelogParams): Promise<Gamelog> {
        const gamelog = await this.gamelogRepository.findOne({
            where: {  id: Equal(gamelogId) },
            relations: ['gamelogToUsers.user'],
        });

        if (!gamelog) throw new NotFoundException(`Gamelog with ID ${gamelogId} not found`);

        const gamelogToUsers = await this.createOrUpdateGamelogToUsers(gamelogDetails.userResults, gamelog)
            .finally(() => delete gamelogDetails.userResults);

        return (await this.gamelogRepository.save({
            ...gamelog,
            ...gamelogDetails,
            gamelogToUsers: gamelogToUsers,
        }));
    }

    async deleteGamelog(gamelogId: bigint = undefined): Promise<string> {
        const gamelog = await this.gamelogRepository.findOne({
            where: { id: Equal(gamelogId) },
        });

        if (!gamelog) throw new NotFoundException(`Gamelog with ID ${gamelogId} not found`);

        await this.gamelogRepository.remove(gamelog);
        return (`Gamelog with ID ${gamelogId} successfully deleted`);
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

    private async createOrUpdateGamelogToUsers(userResultsWithUsername: UserResultWithUsername[], gamelog: Gamelog = undefined): Promise<GamelogToUser[]> {
        const userResultsWithUser = await this.setUserResultsWithUser(userResultsWithUsername).finally(() => userResultsWithUsername = null);

        const existingGamelogToUsers = gamelog?.gamelogToUsers || [];
        const gamelogToUsers: GamelogToUser[] = [];
        
        for (const userResult of userResultsWithUser) {
            const existingGtu = existingGamelogToUsers.find((gtu) => gtu.user.username === userResult.user.username);

            if (existingGtu) gamelogToUsers.push(this.gamelogToUserRepository.merge(existingGtu, { ...userResult }));
            else gamelogToUsers.push(this.gamelogToUserRepository.create({ ...userResult }));
        }

        return (gamelogToUsers);
    }

    private async setUserResultsWithUser(userResultsWithUsername: UserResultWithUsername[]): Promise<UserResultWithUser[]> {
        const usernames = userResultsWithUsername.map((userResult) => userResult.username);

        if (usernames.length !== new Set(usernames).size) {
            const duplicateUsernames = usernames.filter((username, i) => usernames.indexOf(username) !== i);
            throw new BadRequestException(`Duplicate username${duplicateUsernames.length > 1 ? 's' : ''} given: ${duplicateUsernames.join(', ')}`);
        }

        const users = await this.userRepository.find({
            where: { username: In(usernames) },
        });

        if (users.length !== usernames.length) {
            const missingUsernames = usernames.filter((username) => !users.some((user) => user.username === username));
            throw new BadRequestException(`User${missingUsernames.length > 1 ? 's weren\'t' : ' wasn\'t'} found: ${missingUsernames.join(', ')}`);
        }

        const userMap = new  Map<string, User>();
        users.forEach((user) => userMap.set(user.username, user));

        const userResultsWithUser = userResultsWithUsername.map((userResult) => {
            const { username, ...rest } = userResult;
            return ({
                user: userMap.get(username),
                ...rest,
            });
        });

        return (userResultsWithUser);
    }

}
