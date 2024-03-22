import { DynamicModule, Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { TypeOrmModule } from "@nestjs/typeorm";
import { File } from "./entities/file.entity";
import { FileUploadsOptionsInterface } from "./types/file-upload-options.type";
import { multerConfigFactory } from "./configs/file-uploads-multer-factory.config";

@Module({})
export class FileUploadsModule {

    static register(options: FileUploadsOptionsInterface): DynamicModule {
        return ({
            module: FileUploadsModule,
            imports: [
                TypeOrmModule.forFeature([File]),
                MulterModule.registerAsync({
                    useFactory: () => multerConfigFactory(options),
                }),
            ],
            controllers: [],
            providers: [],
            exports: [MulterModule, TypeOrmModule],
        });
    }

}