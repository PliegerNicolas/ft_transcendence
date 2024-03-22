import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/User.entity';
import { Equal, Repository } from 'typeorm';
import { File } from '../../../file-uploads/entities/file.entity';

import { DEFAULT_USER_PICTURE_PATH } from '../../../file-uploads/configs/file-uploads.constants';
import { MimeTypes } from '../../../file-uploads/enums/mime-types.enum';
import * as fileSystem from 'fs';
import * as path from 'path';
import * as mimeTypes from 'mime-types';
import * as chardet from 'chardet';

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

        if (!picture) {
            return (this.getDefaultUserPicture());
        }

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

        //if (!picture) throw new BadRequestException(`User ${username ? username : '{undefined}'} has no picture`);

        user.picture = this.fileRepository.create({
            ...file,
        });

        await this.userRepository.save(user);
        if (picture)
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

    /* Helper Functions */

    public async getDefaultUserPicture(): Promise<File> {
        const defaultUserPicturePath: string = DEFAULT_USER_PICTURE_PATH;

        if (!fileSystem.existsSync(defaultUserPicturePath)) throw new UnprocessableEntityException(`Default User picture not stored locally`);

        const size: number = fileSystem.statSync(defaultUserPicturePath).size;
        const originalname: string = path.basename(defaultUserPicturePath);

        const defaultPicture = this.fileRepository.create({
            fieldname: 'default_user_picture',
            originalname: originalname,
            encoding: this.detectEncoding(defaultUserPicturePath),
            mimetype: this.detectMimeType(defaultUserPicturePath),
            size: size,
            path: defaultUserPicturePath,
        });

        return (defaultPicture);
    }

    private detectEncoding(filePath: string): string {
        const fileData = fileSystem.readFileSync(filePath);
        const encoding = chardet.detect(fileData);
        if (!encoding) throw new UnprocessableEntityException(`Encoding type of '${filePath}' not recognized`);
        return (encoding);
      }

    private detectMimeType(filePath: string): MimeTypes {
        const mimeType = mimeTypes.lookup(filePath);
        if (!(mimeType && Object.values(MimeTypes).includes(mimeType as MimeTypes))) throw new UnprocessableEntityException(`MimeType of '${filePath}' not recognized`);
        return (mimeType as MimeTypes);
    }

}
