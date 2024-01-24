import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Length } from 'class-validator';
import { Gamelog } from 'src/gamelogs/entities/Gamelog';
import { GameResult, UserToGamelog } from 'src/gamelogs/entities/UserToGamelog';
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

        console.log(user.gamelogs);

        return (user.gamelogs);
    }

    async createGamelog(gamelogDetails: CreateGamelogParams): Promise<Gamelog> {
        const users = await this.userRepository.find({
            where: { id: In(gamelogDetails.userIds) },
        });

        if (users.length !== gamelogDetails.userIds.length) {
            throw new NotFoundException(`Some users of the given list (${gamelogDetails.userIds}) couldn't be found`);
        }

        const gamelog = this.gamelogRepository.create({
            users: users,
            userToGamelogs: this.generateUserToGamelogs(users, gamelogDetails.results),
            ...gamelogDetails,
        });

        return (await this.gamelogRepository.save(gamelog));
    }

    async replaceGamelog(id: number, gamelogDetails: ReplaceGamelogParams): Promise<Gamelog> {
        const gamelog = await this.gamelogRepository.findOne({
            where: { id },
            relations: ['userToGamelogs.user'],
        });

        if (!gamelog) throw new NotFoundException(`Gamelog with ID ${id} not found`);

        const users = await this.userRepository.find({
            where: { id: In(gamelogDetails.userIds) },
        });

        if (users.length !== gamelogDetails.userIds.length) {
            throw new NotFoundException(`Some users of the given list (${gamelogDetails.userIds}) couldn't be found`);
        }

        return (await this.gamelogRepository.save({
            ...gamelog,
            users: users,
            userToGamelogs: this.generateUserToGamelogs(users, gamelogDetails.results),
            ...gamelogDetails,
        }));
    }

    async updateGamelog(id: number, gamelogDetails: UpdateGamelogParams): Promise<Gamelog> {
        const gamelog = await this.gamelogRepository.findOne({
            where: { id },
            relations: ['userToGamelogs.user'],
        });

        if (!gamelog) throw new NotFoundException(`Gamelog with ID ${id} not found`);

        let users = undefined;

        if (gamelogDetails.userIds) {
            users = await this.userRepository.find({
                where: { id: In(gamelogDetails.userIds) },
            });

            if (users.length !== gamelogDetails.userIds.length) {
                throw new NotFoundException(`Some users of the given list (${gamelogDetails.userIds}) couldn't be found`);
            }
        }

        return (await this.gamelogRepository.save({
            ...gamelog,
            users: users ? users : gamelog.users,
            userToGamelogs: gamelog.userToGamelogs ? this.generateUserToGamelogs(users, gamelogDetails.results) : gamelog.userToGamelogs,
            ...gamelogDetails
        }));
    }

    async deleteGamelog(id: number): Promise<string> {
        await this.gamelogRepository.delete(id);
        return (`Gamelog with ID ${id} successfully deleted`);
    }

    /* Helper Functions */

    private generateUserToGamelogs(users: User[], results: GameResult[]): UserToGamelog[] {
        if (!users) return (null);

        const userToGamelogs = users.map((user, i) => {
            const userToGamelog = new UserToGamelog();
            userToGamelog.user = user;
            userToGamelog.result = results[i] || GameResult.UNDEFINED;
            return (userToGamelog);
        });

        return (userToGamelogs);
    }

}
