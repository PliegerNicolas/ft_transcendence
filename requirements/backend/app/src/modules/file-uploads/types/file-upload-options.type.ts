import { MimeTypes } from "../enums/mime-types.enum";

export interface FileUploadsOptionsInterface {
    dest: string;
    allowedMimetypes: MimeTypes[];
    maxSize: number;
}

export class FileUploadOptions {
    dest: string;
    allowedMimetypes: MimeTypes[];
    maxSize: number;
}