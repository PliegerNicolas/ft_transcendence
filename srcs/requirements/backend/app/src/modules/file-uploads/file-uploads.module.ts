import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import fileUploadsConfig, { FileUploadsConfig } from "./configs/file-uploads.config";
import { multerModuleAsyncOptions } from "./configs/multer-module-async.options";

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
                MulterModule.registerAsync(multerModuleAsyncOptions),
            ],
        });
    }
}