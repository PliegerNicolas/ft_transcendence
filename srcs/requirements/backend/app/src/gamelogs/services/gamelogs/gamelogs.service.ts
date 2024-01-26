import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Length } from 'class-validator';
import { UserResult } from 'src/gamelogs/dtos/UserResult.dto';
import { Gamelog } from 'src/gamelogs/entities/Gamelog';
import { GameResult, UserToGamelog } from 'src/gamelogs/entities/UserToGamelog';
import { GamelogsModule } from 'src/gamelogs/gamelogs.module';
import { CreateGamelogParams, ReplaceGamelogParams, UpdateGamelogParams } from 'src/gamelogs/types/gamelogs.types';
import { User } from 'src/users/entities/User';
import { In, Repository } from 'typeorm';

@Injectable()
export class GamelogsService {

    constructor(
        @InjectRepository(Gamelog)
        private readonly gamelogRepository: Repository<Gamelog>,
        @InjectRepository(UserToGamelog)
        private readonly userToGamelogRepository: Repository<Gamelog>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getGamelogs(): Promise<Gamelog[]> {
        return (await this.gamelogRepository.find({
            relations: ['userToGamelogs.user'],
        }));
    }

    async getUserGamelogs(userId: number): Promise<Gamelog[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['gamelogs.userToGamelogs.user'],
        })

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        return (user.gamelogs);
    }

    async createGamelog(gamelogDetails: CreateGamelogParams): Promise<Gamelog> {
        const usersAndGamelogs = await this.findUsersAndGenerateResults(gamelogDetails.userResults);
        delete gamelogDetails.userResults;

        const gamelog = this.gamelogRepository.create({
            users: usersAndGamelogs.users,
            userToGamelogs: usersAndGamelogs.userToGamelogs,
            ...gamelogDetails,
        });

        return (await this.gamelogRepository.save({
            ...gamelog,
            ...gamelogDetails,
        }));
    }

    async replaceGamelog(id: number, gamelogDetails: ReplaceGamelogParams): Promise<Gamelog> {
        const gamelog = await this.gamelogRepository.findOne({
            where: { id },
            relations: ['userToGamelogs.user'],
        })

        if (!gamelog) throw new NotFoundException(`Gamelog with ID ${id} not found`);

        const usersAndGamelogs = await this.findUsersAndGenerateResults(gamelogDetails.userResults);
        delete gamelogDetails.userResults;

        return (await this.gamelogRepository.save({
            ...gamelog,
            users: usersAndGamelogs.users,
            userToGamelogs: usersAndGamelogs.userToGamelogs,
            ...gamelogDetails,
        }));
    }

    async updateGamelog(id: number, gamelogDetails: UpdateGamelogParams): Promise<Gamelog> {
        const gamelog = await this.gamelogRepository.findOne({
            where: { id },
            relations: ['userToGamelogs.user'],
        })

        if (!gamelog) throw new NotFoundException(`Gamelog with ID ${id} not found`);

        const usersAndGamelogs = await this.findUsersAndGenerateResults(gamelogDetails.userResults);
        delete gamelogDetails.userResults;

        return (await this.gamelogRepository.save({
            ...gamelog,
            users: usersAndGamelogs.users,
            userToGamelogs: usersAndGamelogs.userToGamelogs,
            ...gamelogDetails,
        }));
    }

    async deleteGamelog(id: number): Promise<string> {
        await this.gamelogRepository.delete(id);
        return (`Gamelog with ID ${id} successfully deleted`);
    }

    /* Helper Functions */

    private async findUsersAndGenerateResults(userResults: UserResult[]): Promise<{ users: User[], userToGamelogs: UserToGamelog[] }> {
        if (!userResults) return (null);

        const users = await this.userRepository.find({
            where: { id: In(userResults.map(userResult => userResult.id)) },
            relations: [],
        });

        if (!users) throw new NotFoundException(`At least one user hasn't been found in the given list (${userResults})`);

        const userToGamelogs = userResults.map((userResult, i) => {
            const userToGamelog = new UserToGamelog();
            userToGamelog.user = users[i];
            userToGamelog.result = userResults[i].result;
            return (userToGamelog);
        });

        return ({ users, userToGamelogs });        
    }

}
