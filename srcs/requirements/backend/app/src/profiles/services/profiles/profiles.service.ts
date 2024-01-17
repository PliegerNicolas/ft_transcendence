import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/profiles/entities/Profile';
import { ReplaceProfileParams, UpdateProfileParams } from 'src/profiles/types/profile.types';
import { Repository } from 'typeorm';

@Injectable()
export class ProfilesService {

    constructor(
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
    ) {}

    async getProfileByUserId(userId: number): Promise <Profile> {
        const profile = await this.profileRepository.findOne({ where: { user: { id: userId } } });

        if (!profile) throw new NotFoundException(`Profile of User with ID ${userId} not found`);

        return (profile);
    }

    async replaceProfile(userId: number, replaceProfileDetails: ReplaceProfileParams): Promise<Profile> {
        const profile = await this.profileRepository.findOne({ where: { user: { id: userId } } });

        if (!profile) throw new NotFoundException(`Profile of User with ID ${userId} not found`);

        return (await this.profileRepository.save({
            ... profile,
            ...replaceProfileDetails,
        }));        
    }

    async updateProfile(userId: number, updateProfileDetails: UpdateProfileParams): Promise<Profile> {
        const profile = await this.profileRepository.findOne({ where: { user: { id: userId } } });

        if (!profile) throw new NotFoundException(`Profile of User with ID ${userId} not found`);

        return (await this.profileRepository.save({
            ...profile,
            ...updateProfileDetails
        }));        
    }

}
