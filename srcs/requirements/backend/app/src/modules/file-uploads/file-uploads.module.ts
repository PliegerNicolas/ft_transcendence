import { BadRequestException, DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from 'uuid';
import fileUploadsConfig, { FileUploadsConfig } from "./configs/file-uploads.config";

@Module({})
export class FileUploadsModule {
    static register(config: FileUploadsConfig): DynamicModule {
        return ({
            module: FileUploadsModule,

            imports: [
                ConfigModule.forRoot({
                    load: [fileUploadsConfig],
                    isGlobal: true,
                }),

                MulterModule.registerAsync({
                    imports: [ConfigModule],
                    inject: [ConfigService],

                    useFactory: (configService: ConfigService<FileUploadsConfig>) => ({
                        dest: config.uploadDest || configService.get<string>('uploadDest'),
                        storage: diskStorage({
                            destination: (req, file, cb) => {
                                cb(null, config.uploadDest || configService.get<string>('uploadDest'));
                            },
                            filename: (req, file, cb) => {
                                const filename = uuidv4();
                                cb(null, `${filename}-${file.originalname}`);
                            },
                        }),
                        fileFilter: (req, file, cb) => {
                            const allowedMimeTypes = config.allowedMimeTypes || configService.get<string[]>('allowedMimeTypes');
                            if (allowedMimeTypes.length <= 0) throw new BadRequestException(`Expect a list of accepted mimetypes`);
                            else if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
                            else throw new BadRequestException(`Invalid file type. Accepted mimetypes are : ${allowedMimeTypes.join(', ')}`);
                        },
                    }),
                }),
            ],
        });
    }
}