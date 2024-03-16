import { HttpsOptions } from "@nestjs/common/interfaces/external/https-options.interface";
import * as fs from 'fs';

export const httpsOptions: HttpsOptions = {
    key: fs.readFileSync('./ssl_certificates/backend_ssl.key'),
    cert: fs.readFileSync('./ssl_certificates/backend_ssl.cert'),
};
