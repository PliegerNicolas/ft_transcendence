import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import fileUploadsConfig, { FileUploadsConfig } from "./configs/file-uploads.config";
import { multerModuleAsyncOptions } from "./configs/multer-module-async.options";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({})
export class FileUploadsModule {
    static register(config: FileUploadsConfig): DynamicModule {
        return ({
            module: FileUploadsModule,
            imports: [
                TypeOrmModule.forFeature([File]),
                MulterModule.registerAsync(multerModuleAsyncOptions),
                ConfigModule.forRoot({
                    load: [fileUploadsConfig],
                    isGlobal: true,
                }),
            ],
            controllers: [],
            providers: [],
            exports: [],
        });
    }
}