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
        // Public ?
        return (this.userRepository.find({}));
    }

    async getUser(id: number): Promise<User> {
        // Public ?
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['profile']
        });

        if (!user) throw new NotFoundException(`User with ID ${id} not found`);

        return (user);
    }

    async createUser(userDetails: CreateUserParams): Promise<User> {
        // Public
        await this.verifyUserUnicity(userDetails.username, userDetails.oauthId);

        const newUser = this.userRepository.create({
            ...userDetails,
            profile: userDetails.profile ? userDetails.profile : this.profileRepository.create(),
        });

        return (await this.userRepository.save(newUser));
    }

    async replaceUser(userId: number, userDetails: ReplaceUserParams): Promise<User> {
        // Only if you're the target user.
        await this.verifyUserUnicity(userDetails.username, userDetails.oauthId);

        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        return (await this.userRepository.save({
            ...user,
            ...userDetails,
            profile: {
                ...user.profile,
                ...userDetails.profile,
            }
        }));
    }

    async updateUser(userId: number, userDetails: UpdateUserParams): Promise<User> {
        // Only if you're the target user.
        await this.verifyUserUnicity(userDetails.username, userDetails.oauthId);

        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        return (await this.userRepository.save({
            ...user,
            ...userDetails,
            profile: {
                ...user.profile,
                ...userDetails.profile,
            }
        }));
    }

    async deleteUser(userId: number): Promise<string> {
        // Only if you're the target user.
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) throw new NotFoundException(`User with ID ${userId}`);

        await this.userRepository.delete(user.id);
        return (`User with ID ${user.id} successfully deleted`);
    }

    /* Helper Functions */

    private async verifyUserUnicity(username: string, oauthId: number) {
        const existingUser = await this.userRepository.findOne({
            where: [
                { username },
                { oauthId },
            ],
        })

        if (existingUser) {
            let errorMessage = `User with `;
            if (existingUser.username === username) {
                errorMessage += `Username (${username}) `;
            }
            if (existingUser.oauthId == oauthId) {
                errorMessage += `${existingUser.username === username ? 'and ' : ''}OauthId (${oauthId}) `;
            }
            throw new BadRequestException(errorMessage + `already exists.`);
        }
    }

}
