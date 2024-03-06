import { MimeTypes } from "../enums/mime-types.enum";

export const MB_MULTIPLICATOR = 1024 * 1024;

export interface FileUploadsConfig {
    uploadDest: string;
    allowedMimeTypes: MimeTypes[];
    maxSizeInBits?: number;
}

const defaultConfig: FileUploadsConfig = {
    uploadDest: `./assets/uploads/pictures`,
    allowedMimeTypes: [MimeTypes.PNG, MimeTypes.JPEG],
    maxSizeInBits: 8 * MB_MULTIPLICATOR,
};

export default (userConfig?: Partial<FileUploadsConfig>): FileUploadsConfig => {
    const config: FileUploadsConfig = {
        ...defaultConfig,
        ...userConfig,
    };

    return (config);
};