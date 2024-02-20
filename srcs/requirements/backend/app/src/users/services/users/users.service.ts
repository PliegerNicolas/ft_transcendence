import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/profiles/entities/Profile.entity';
import { User } from 'src/users/entities/User.entity';
import { CreateUserParams, ReplaceUserParams, UpdateUserParams } from 'src/users/types/user.type';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
    ) {}

    async getUsers(): Promise<User[]> {
        return (await this.userRepository.find());
    }

    async getMyUsers(username: string = null): Promise<User[]> {
        return (await this.userRepository.find({
            relations: ['relationships']
        }));
    }

    async getUser(username: string = null): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { username: username },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User '${username}' not found`);

        return (user);
    }

    async getMyUser(username: string = null): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { username: username },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User '${username}' not found`);

        return (user);
    }

    async createUser(userDetails: CreateUserParams): Promise<User> {
        const { username, oauthId }: { username: string, oauthId: bigint } = userDetails;

        let user = await this.userRepository.findOne({
            where: [
                { username: username },
                { oauthId: oauthId },
            ],
        });

        if (user) {
            const errorDetails = [];
            if (user.username === username) errorDetails.push(`Username '${userDetails.username}'`);
            if (BigInt(user.oauthId) === BigInt(oauthId)) errorDetails.push(`OauthId '${userDetails.oauthId}'`);
            throw new BadRequestException(`User with ${errorDetails.join(' and ')} already exists`);
        }

        user = this.userRepository.create({
            ...userDetails,
        });

        return (await this.userRepository.save(user));
    }

    async replaceUser(username: string, userDetails: ReplaceUserParams): Promise<User> {
        let user = await this.userRepository.findOne({
            where: { username: userDetails.username },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User '${username}' not found`);

        return (await this.userRepository.save({
            ...userDetails,
        }));
    }

    async updateUser(username: string, userDetails: UpdateUserParams): Promise<User> {
        let user = await this.userRepository.findOne({
            where: { username: userDetails.username },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User '${username}' not found`);

        return (await this.userRepository.save({
            ...userDetails,
        }));
    }

    async deleteUser(username: string): Promise<string> {
        let user = await this.userRepository.findOne({
            where: { username: username },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User '${username}' not found`);

        await this.userRepository.remove(user);
        return (`User '${username}' successfully deleted`);
    }

}
