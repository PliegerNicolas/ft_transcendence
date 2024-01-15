import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/profiles/entities/Profile';
import { User } from 'src/users/entities/User';
import { CreateUserParams, UpdateUserParams } from 'src/utils/types';
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
        return (this.userRepository.find());
    }

    async getUser(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['profile']
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return (user);
    }

    async createUser(userDetails: CreateUserParams): Promise<User> {
        const newUser = this.userRepository.create({
            ...userDetails,
            profile: await this.profileRepository.save(userDetails.profile || this.profileRepository.create()),
        });

        return (await this.userRepository.save(newUser));
    }

    async updateUser(id: number, updateUserDetails: UpdateUserParams): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['profile'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (updateUserDetails.profile) {
            await this.profileRepository.save({
                ...user.profile,
                ...updateUserDetails.profile,
            });
        }

        await this.userRepository.save({
            ...user,
            ...updateUserDetails,
            profile: undefined,
        });
    }

    async deleteUser(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }

}
