import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/User.entity';
import { Equal, Repository } from 'typeorm';
import { File } from '../../../file-uploads/entities/file.entity';
import { DEFAULT_USER_PICTURE_PATH } from 'src/modules/file-uploads/configs/file-uploads.constants';
import * as fs from 'fs';
import * as chardet from 'chardet';
import * as path from 'path';
import * as mimeTypes from 'mime-types';
import { MimeTypes } from 'src/modules/file-uploads/enums/mime-types.enum';

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
        
        const defaultPicture = await this.getDefaultUserPicture();

        if (picture.id === defaultPicture.id) throw new BadRequestException(`Default user picture already set`);

        user.picture = defaultPicture;
        await this.userRepository.save(user);
        await this.fileRepository.remove(picture);

        return (`User '${username}'s picture successfully deleted`);
    }

    /* Default user picture */

    async getDefaultUserPicture(): Promise<File> {
        const picture = await this.fileRepository.findOne({
            where: { fieldname: Equal('default_user_picture') },
        });

        if (!picture) throw new NotFoundException(`User default picture not found`);

        return (picture);
    }

    async createDefaultUserPicture(): Promise<void> {
        let picture = await this.fileRepository.findOne({
            where: { fieldname: Equal('default_user_picture') },
        });

        if (picture) throw new BadRequestException(`Default user picture already exists as File with ID ${picture.id}`);

        const defaultUserPicturePath = DEFAULT_USER_PICTURE_PATH;
        let size: number;

        try {
            size = fs.statSync(defaultUserPicturePath).size;
        } catch(error) {
            throw new UnprocessableEntityException(`Couldn't read ${defaultUserPicturePath}. Verify if file exists`);
        }

        const filename = path.basename(defaultUserPicturePath);
        const encoding = this.detectEncoding(defaultUserPicturePath);
        const mimetype = this.detectMimetype(defaultUserPicturePath);

        picture = this.fileRepository.create({
            fieldname: 'default_user_picture',
            originalname: filename,
            encoding: encoding,
            mimetype: mimetype,
            size: size,
            path: defaultUserPicturePath,
        });

        await this.fileRepository.save(picture);
    }

    private detectEncoding(filePath: string): string {
        const fileData = fs.readFileSync(filePath);
        return (chardet.detect(fileData));
    }

    private detectMimetype(filePath: string): MimeTypes {
        const mimeType = mimeTypes.lookup(filePath);
        if (!mimeType || !Object.values(MimeTypes).includes(mimeType as MimeTypes)) throw new UnprocessableEntityException(`MimeType ${mimeType} not recognized`);
        return (mimeType as MimeTypes);
    }

}
