import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '../..//entities/Profile.entity';
import { CreateProfileParams, ReplaceProfileParams, UpdateProfileParams } from '../../types/profile.type';
import { User } from '../../../users/entities/User.entity';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class ProfilesService {

    constructor(
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getProfile(username: string = undefined): Promise<Profile> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}' }' not found`);

        return (user.profile);
    }

    async getMyProfile(username: string = undefined): Promise<Profile> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}' }' not found`);

        return (user.profile);
    }    

    async createProfile(username: string = undefined, profileDetails: CreateProfileParams): Promise<Profile> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: ['profile'],
        });

        if (!user) throw new NotFoundException(`User '${username ? username : '{undefined}' }' not found`);
        else if (user.profile) throw new BadRequestException(`User '${username}'s Profile already exists`);

        const profile = this.profileRepository.create({
            user: user,
            ...profileDetails,
        });

        return (await this.profileRepository.save(profile));
    }

    async replaceProfile(username: string = undefined, profileDetails: ReplaceProfileParams): Promise<Profile> {
        const profile = await this.profileRepository.findOne({
            where: { user: { username: Equal(username) } },
            relations: ['picture'],
        });

        if (!profile) throw new NotFoundException(`Profile of User '${username ? username : '{undefined}'}' not found`);

        this.profileRepository.merge(profile, {
            ...profileDetails,
        });

        return (await this.profileRepository.save(profile));
    }

    async updateProfile(username: string = undefined, profileDetails: UpdateProfileParams): Promise<Profile> {
        const profile = await this.profileRepository.findOne({
            where: { user: { username: Equal(username) } },
        });

        if (!profile) throw new NotFoundException(`Profile of User '${username ? username : '{undefined}' }' not found`);

        this.profileRepository.merge(profile, {
            ...profileDetails,
        });

        return (await this.profileRepository.save(profile));
    }

    async clearProfile(username: string = undefined): Promise<Profile> {
        const profile = await this.profileRepository.findOne({
            where: { user: { username: Equal(username) } },
            relations: ['picture'],
        });

        if (!profile) throw new NotFoundException(`Profile of User '${username ? username : '{undefined}' }' not found`);

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
