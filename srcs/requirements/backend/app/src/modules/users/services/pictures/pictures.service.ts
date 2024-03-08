import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/User.entity';
import { Equal, Repository } from 'typeorm';
import { File } from '../../../file-uploads/entities/file.entity';

@Injectable()
export class PicturesService {
    
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(File)
        private readonly fileRepository: Repository<File>,
    ) {}

    async getPicture(username: string = undefined): Promise<File> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: ['picture'],
        });

        if (!user) throw new NotFoundException(`User ${username ? username : '{undefined}'} not found`);

        const picture = user.picture;

        if (!picture) throw new NotFoundException(`User ${username ? username : '{undefined}'}'s picture not found`);

        return (picture);
    }

    async createPicture(username: string = undefined, file: Express.Multer.File): Promise<File> {
        if (!file) throw new BadRequestException('No file passed');

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: ['picture'],
        });

        if (!user) throw new NotFoundException(`User ${username ? username : '{undefined}'} not found`);

        if (user.picture) throw new BadRequestException(`User ${username ? username : '{undefined}'} already has a picture`);

        console.log(file);

        user.picture = this.fileRepository.create({
            ...file,
        });

        await this.userRepository.save(user);
        return (user.picture);
    }

    async replacePicture(username: string = undefined, file: Express.Multer.File): Promise<File> {
        if (!file) throw new BadRequestException('No file passed');

        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: ['picture'],
        });

        if (!user) throw new NotFoundException(`User ${username ? username : '{undefined}'} not found`);
        
        const picture = user.picture;

        if (!picture) throw new BadRequestException(`User ${username ? username : '{undefined}'} has no picture`);

        user.picture = this.fileRepository.create({
            ...file,
        });
        await this.userRepository.save(user);

        await this.fileRepository.remove(picture);
        return (user.picture);
    }

    async deletePicture(username: string = undefined): Promise<string> {
        const user = await this.userRepository.findOne({
            where: { username: Equal(username) },
            relations: ['picture'],
        });

        if (!user) throw new NotFoundException(`User ${username ? username : '{undefined}'} not found`);
        
        const picture = user.picture;

        if (!picture) throw new BadRequestException(`User ${username ? username : '{undefined}'} has no picture`);
        
        user.picture = null;
        await this.userRepository.save(user);

        await this.fileRepository.remove(picture);

        return (`User '${username}'s picture successfully deleted`);
    }

}
