import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from 'src/modules/file-uploads/entities/file.entity';
import { User } from 'src/modules/users/entities/User.entity';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class ProfilePicturesService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(File)
        private readonly fileRepository: Repository<File>,
    ) {}

    async getProfilePicture(username: string = undefined): Promise<File> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: ['profile.picture'],
        });

        if (!user) throw new NotFoundException(`User ${username ? username : '{undefined}'} not found`);

        const picture = user.profile.picture;

        if (!picture) throw new NotFoundException(`User ${username ? username : '{undefined}'}'s profile picture not found`);

        return (picture);
    }

    async createProfilePicture(username: string = undefined, file: Express.Multer.File): Promise<File> {
        if (!file) throw new BadRequestException('No file passed');

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: ['profile.picture'],
        });

        if (!user) throw new NotFoundException(`User ${username ? username : '{undefined}'} not found`);

        if (user.profile.picture) throw new BadRequestException(`User ${username ? username : '{undefined}'} already has a profile picture`);

        console.log(file);

        user.profile.picture = this.fileRepository.create({
            ...file,
        });

        await this.userRepository.save(user);
        return (user.profile.picture);
    }

    async replaceProfilePicture(username: string = undefined, file: Express.Multer.File): Promise<File> {
        if (!file) throw new BadRequestException('No file passed');
        return (null);
    }

    async deleteProfilePicture(username: string = undefined): Promise<File> {
        return (null);
    }

}
