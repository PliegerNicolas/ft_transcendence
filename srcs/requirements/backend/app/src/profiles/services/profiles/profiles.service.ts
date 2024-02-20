import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/profiles/entities/Profile.entity';
import { CreateProfileParams, ReplaceProfileParams, UpdateProfileParams } from 'src/profiles/types/profile.type';
import { User } from 'src/users/entities/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProfilesService {

    constructor(
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getProfile(username: string = null): Promise<Profile> {
        const user = await this.userRepository.findOne({
            where: { username: username },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User '${username}' not found`);

        return (user.profile);
    }

    async getMyProfile(username: string = null): Promise<Profile> {
        const user = await this.userRepository.findOne({
            where: { username: username },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User '${username}' not found`);

        return (user.profile);
    }    

    async createProfile(username: string, profileDetails: CreateProfileParams): Promise<Profile> {
        const user = await this.userRepository.findOne({
            where: { username: username },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User '${username}' not found`);
        else if (user.profile) throw new BadRequestException(`User '${username}'s Profile already exists`);

        const profile = this.profileRepository.create({
            user: user,
            ...profileDetails,
        });

        return (await this.profileRepository.save(profile));
    }

    async replaceProfile(username: string, profileDetails: ReplaceProfileParams): Promise<Profile> {
        const profile = await this.profileRepository.findOne({
            where: { user: { username: username } },
        });

        if (!profile) throw new NotFoundException(`Profile of User '${username}' not found`);

        return (await this.profileRepository.save({
            ...profile,
            ...profileDetails,
        }));
    }

    async updateProfile(username: string, profileDetails: ReplaceProfileParams): Promise<Profile> {
        const profile = await this.profileRepository.findOne({
            where: { user: { username: username } },
        });

        if (!profile) throw new NotFoundException(`Profile of User '${username}' not found`);

        return (await this.profileRepository.save({
            ...profile,
            ...profileDetails,
        }));
    }

    async clearProfile(username: string): Promise<Profile> {
        const profile = await this.profileRepository.findOne({
            where: { user: { username: username } },
        });

        if (!profile) throw new NotFoundException(`Profile of User '${username}' not found`);

        const emptyProfile: Partial<Profile> = {
            ...Object.fromEntries(Object.keys(profile).map((key) => [key, null])),
            id: profile.id,
            user: profile.user,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
        };

        return (await this.profileRepository.save(emptyProfile));
    }

}
