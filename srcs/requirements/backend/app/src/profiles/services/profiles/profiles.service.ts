import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/profiles/entities/Profile.entity';
import { ReplaceProfileParams, UpdateProfileParams } from 'src/profiles/types/profile.type';
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

    async getProfileByUserId(username: string): Promise <Profile> {
        const user = await this.userRepository.findOne({
            where: { username: username },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User with Username '${username}' not found`);

        return (user.profile);
    }

    async replaceProfile(username: string, profileDetails: ReplaceProfileParams): Promise<Profile> {
        const profile = await this.profileRepository.findOne({
            where: {
                user: { username: username }
            }
        });

        if (!profile) throw new NotFoundException(`Profile of User with Username '${username}' not found`);

        return (await this.profileRepository.save({
            ...profile,
            ...profileDetails,
        }));        
    }

    async updateProfile(username: string, profileDetails: UpdateProfileParams): Promise<Profile> {
        const profile = await this.profileRepository.findOne({
            where: {
                user: { username: username }
            }
        });

        if (!profile) throw new NotFoundException(`Profile of User with Username '${username}' not found`);

        return (await this.profileRepository.save({
            ...profile,
            ...profileDetails
        }));        
    }

}
