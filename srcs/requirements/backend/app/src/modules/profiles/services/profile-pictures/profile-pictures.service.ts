import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProfilePicturesService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getProfilePicture() {

    }

    async createProfilePicture() {
        
    }

    async replaceProfilePicture() {
        
    }

    async deleteProfilePicture() {
        
    }

}
