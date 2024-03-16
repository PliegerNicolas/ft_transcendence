import { HttpsOptions } from "@nestjs/common/interfaces/external/https-options.interface";
import * as fs from 'fs';

export const httpsOptions: HttpsOptions = {
    key: fs.readFileSync('./ssl/nestjs_ssl.key'),
    cert: fs.readFileSync('./ssl/nestjs_ssl.cert'),
};