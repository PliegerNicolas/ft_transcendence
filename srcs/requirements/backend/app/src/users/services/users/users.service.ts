import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/profiles/entities/Profile.entity';
import { User } from 'src/users/entities/User.entity';
import { CreateUserParams, ReplaceUserParams, UpdateUserParams } from 'src/users/types/user.type';
import { Equal, Repository } from 'typeorm';

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

    async getMyUsers(username: string = undefined): Promise<User[]> {
        return (await this.userRepository.find({
            relations: ['relationships']
        }));
    }

    async getUser(username: string = undefined): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        return (user);
    }

    async getMyUser(username: string = undefined): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        return (user);
    }

    async createUser(userDetails: CreateUserParams): Promise<User> {
        let user = await this.userRepository.findOne({
            where: [
                { username: Equal(userDetails.username) },
                { oauthId: Equal(userDetails.oauthId) },
            ],
        });

        if (user) {
            const errorDetails = [];
            if (user.username === userDetails.username) errorDetails.push(`Username '${userDetails.username}'`);
            if (BigInt(user.oauthId) === BigInt(userDetails.oauthId)) errorDetails.push(`OauthId '${userDetails.oauthId}'`);
            throw new BadRequestException(`User with ${errorDetails.join(' and/or ')} already exists`);
        }

        user = this.userRepository.create({
            ...userDetails,
        });

        return (await this.userRepository.save(user));
    }

    async replaceUser(username: string = undefined, userDetails: ReplaceUserParams): Promise<User> {
        let user = await this.userRepository.findOne({
            where: [
                { username: Equal(userDetails.username) },
                { oauthId: Equal(userDetails.oauthId) }
            ],
        });

        if (user) {
            const errorDetails = [];
            if (user.username === userDetails.username) errorDetails.push(`Username '${userDetails.username}'`);
            if (BigInt(user.oauthId) === BigInt(userDetails.oauthId)) errorDetails.push(`OauthId '${userDetails.oauthId}'`);
            throw new BadRequestException(`User with ${errorDetails.join(' and/or ')} already exists`);
        }
    
        user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        return (await this.userRepository.save({
            ...userDetails,
        }));
    }

    async updateUser(username: string = undefined, userDetails: UpdateUserParams): Promise<User> {
        let user = await this.userRepository.findOne({
            where: [
                { username: Equal(userDetails.username) },
                { oauthId: Equal(userDetails.oauthId) }
            ],
        });

        if (user) {
            const errorDetails = [];
            if (user.username === userDetails.username) errorDetails.push(`Username '${userDetails.username}'`);
            if (BigInt(user.oauthId) === BigInt(userDetails.oauthId)) errorDetails.push(`OauthId '${userDetails.oauthId}'`);
            throw new BadRequestException(`User with ${errorDetails.join(' and/or ')} already exists`);
        }
    
        user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        return (await this.userRepository.save({
            ...userDetails,
        }));
    }

    async deleteUser(username: string = undefined): Promise<string> {
        let user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        await this.userRepository.remove(user);
        return (`User '${username}' successfully deleted`);
    }

}
