import { ConfigModule, ConfigService } from "@nestjs/config";
import { FileUploadsConfig } from "./file-uploads.config";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, forwardRef } from "@nestjs/common";

const multerModuleConfigFactory = (configService: ConfigService<FileUploadsConfig>) => ({
    dest: configService.get<string>('uploadDest'),
    storage: diskStorage({
        destination: (req, file, cb) => {
            cb(null, configService.get<string>('uploadDest'));
        },
        filename: (req, file, cb) => {
            const filename = uuidv4();
            cb(null, `${filename}-${file.originalname}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = configService.get<string[]>('allowedMimeTypes');
        if (allowedMimeTypes.length <= 0) throw new BadRequestException(`Expecting a list of mimetypes`);
        else if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
        else throw new BadRequestException(`Invalid file type. Accepted mimetypes are : ${allowedMimeTypes.join(', ')}`);
    },
    limits: {
        fileSize: configService.get<number>('maxSizeInBits'),
    },
});

export const multerModuleAsyncOptions = {
    imports: [forwardRef(() => ConfigModule)],
    inject: [forwardRef(() => ConfigService)],
    useFactory: multerModuleConfigFactory,
};