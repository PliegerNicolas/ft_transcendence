import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserParams, ReplaceUserParams, UpdateUserParams } from '../../types/user.type';
import { Equal, In, Repository } from 'typeorm';
import { User } from '../../entities/User.entity';
import { PicturesService } from '../pictures/pictures.service';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly pictureService: PicturesService,
    ) {}

    async getUsers(): Promise<User[]> {
        return (await this.userRepository.find({relations: ['profile']}));
    }

    async getUser(username: string = undefined): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: ['profile', 'picture'],
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
			accountname : userDetails.username,
            picture: null,
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
            relations: ['profile', 'picture'],
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        this.userRepository.merge(user, {
            ...userDetails,
        });

        return (await this.userRepository.save(user));
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
            relations: ['profile', 'picture'],
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        this.userRepository.merge(user, {
            ...userDetails,
        });

        return (await this.userRepository.save(user));
    }

    async deleteUser(username: string = undefined): Promise<string> {
        let user = await this.userRepository.findOne({
            where: { username: Equal(username) },
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}'}' not found`);

        await this.userRepository.remove(user);
        return (`User '${username}' successfully deleted`);
    }

	/* Two Factor Authentification */

    async setTwoFactorAuthSecret(user: User, secret: string): Promise<User> {
        if (!user) return ;

        this.userRepository.merge(user, {
            twoFactorAuthSecret: secret
        });

        return (await this.userRepository.save(user));
    }

	async turnOnTwoFactorAuthentication(userId: number) {
		return this.userRepository.update(userId, {isTwoFactorAuthEnabled: true});
	}

	async turnOffTwoFactorAuthentication(userId: number) {
		return this.userRepository.update(userId, {isTwoFactorAuthEnabled: false, twoFactorAuthSecret: null});
	}

    /* Helper Functions */

    public async findStrictlyUsersByUsername(usernames: string[]): Promise<User[]> {
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

        return (users);
    }

    public async findStrictlyUsersAndRelationshipsByUsername(usernames: string[]): Promise<User[]> {
        if (usernames.length !== new Set(usernames).size) {
            const duplicateUsernames = usernames.filter((username, i) => usernames.indexOf(username) !== i);
            throw new BadRequestException(`Duplicate username${duplicateUsernames.length > 1 ? 's' : ''} given: ${duplicateUsernames.join(', ')}`);
        }

        const users = await this.userRepository.find({
            where: { username: In(usernames) },
            relations: [
                'relationships1.user1', 'relationships1.user2',
                'relationships2.user1', 'relationships2.user2'
            ],
        });

        if (users.length !== usernames.length) {
            const missingUsernames = usernames.filter((username) => !users.some((user) => user.username === username));
            throw new BadRequestException(`User${missingUsernames.length > 1 ? 's weren\'t' : ' wasn\'t'} found: ${missingUsernames.join(', ')}`);
        }

        return (users);
    }

}
