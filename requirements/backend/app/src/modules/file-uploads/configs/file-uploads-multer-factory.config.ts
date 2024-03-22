import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { FileUploadsOptionsInterface } from '../types/file-upload-options.type';
import { MimeTypes } from '../enums/mime-types.enum';
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';

export const multerConfigFactory = (options: FileUploadsOptionsInterface): MulterOptions => ({
    dest: options.dest,
    storage: diskStorage({
        destination: options.dest,
        filename: (req, file, cb) => {
            const originalFileName = file.originalname;
            const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
            const uniqueFileName = `${uuidv4()}-${sanitizedFileName}`;
            cb(null, uniqueFileName);
        },
    }),
    fileFilter: (req, file, cb) => {
        try {
            if (options.allowedMimetypes.length <= 0) throw new UnprocessableEntityException(`At least one allowedMimetype expected`);

            const normalizedMimeType = file.mimetype as MimeTypes;

            if (options.allowedMimetypes.includes(normalizedMimeType)) cb(null, true);
            else throw new BadRequestException(`File's mimetype should be part of the following list: ${options.allowedMimetypes.join(', ')}`);
        } catch(error) {
            cb(error, false);
        }
    },
    limits: {
        fileSize: options.maxSize,
    },
});
