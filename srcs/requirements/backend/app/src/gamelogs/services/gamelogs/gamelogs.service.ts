import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gamelog } from 'src/gamelogs/entities/Gamelog';
import { GameResult, UserToGamelog } from 'src/gamelogs/entities/UserToGamelog';
import { CreateGamelogParams } from 'src/gamelogs/types/gamelogs.types';
import { User } from 'src/users/entities/User';
import { In, Repository } from 'typeorm';

@Injectable()
export class GamelogsService {

    constructor(
        @InjectRepository(Gamelog)
        private readonly gamelogRepository: Repository<Gamelog>,
        @InjectRepository(UserToGamelog)
        private readonly userToGamelogRepository: Repository<UserToGamelog>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getGamelogs(): Promise<Gamelog[]> {
        return (await this.gamelogRepository.find({
            relations: ['userToGamelog', 'userToGamelog.user'],
        }));
    }

    async getUserGamelogs(userId: number): Promise<Gamelog[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['gamelogs', 'userToGamelog'],
        })

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        return (user.gamelogs);
    }

    async createGamelog(gamelogDetails: CreateGamelogParams): Promise<Gamelog> {
        const users = await this.userRepository.find({
            where: { id: In(gamelogDetails.userIds) }
        });

        if (users.length !== gamelogDetails.userIds.length) throw new NotFoundException(`Some users of the given list (${gamelogDetails.userIds}) couldn't be found`);

        const gamelog = this.gamelogRepository.create({
            users: users,
            userToGamelog: users.map((user, index) => ({
                user: user,
                result: gamelogDetails.results[index] || GameResult.UNDEFINED,
            })),
            ...gamelogDetails,
        });

        return (await this.gamelogRepository.save(gamelog));
    }

}
