import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/typeorm/entities/Profile';
import { CreateProfileParams, UpdateProfileParams } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class ProfilesService {

    constructor(
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
    ) {}

    async getProfiles(): Promise<Profile[]> {
        return (this.profileRepository.find());
    }

    async getProfile(id: number): Promise<Profile> {
        const profile = await this.profileRepository.findOne({ where: { id }});
        if (!profile) {
            throw new NotFoundException(`Profile with ID ${id} not found.`);
        }
        return (profile);
    }

    async createProfile(profileDetails: CreateProfileParams): Promise<Profile> {
        const newProfile = this.profileRepository.create({ ...profileDetails });
        return (await this.profileRepository.save(newProfile));
    }
        
    async updateProfile(id: number, updateProfileDetails: UpdateProfileParams): Promise<void> {
        const updateResult = await this.profileRepository.update(id, updateProfileDetails);
        if (updateResult.affected === 0) {
            throw new NotFoundException(`Profile with ID ${id} not found.`);
        }
    }
    
    async deleteProfile(id: number): Promise<void> {
        const deleteResult = await this.profileRepository.delete(id);
        if (deleteResult.affected === 0) {
            throw new NotFoundException(`Profile with ID ${id} not found.`);
        }
    }

}
