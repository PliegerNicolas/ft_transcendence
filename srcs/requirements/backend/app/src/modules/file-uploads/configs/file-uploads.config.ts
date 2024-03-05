import { MimeTypes } from "../enums/mime-types.enum";

export interface FileUploadsConfig {
    pathSuffix: string;
    uploadDest: string;
    allowedMimeTypes: MimeTypes[];
}

const defaultConfig: FileUploadsConfig = {
    pathSuffix: 'pictures',
    uploadDest: `./assets/uploads/pictures`,
    allowedMimeTypes: [MimeTypes.PNG, MimeTypes.JPEG],
};

export default (userConfig?: Partial<FileUploadsConfig>): FileUploadsConfig => {
    const config: FileUploadsConfig = {
        ...defaultConfig,
        ...userConfig,
    };

    return (config);
};