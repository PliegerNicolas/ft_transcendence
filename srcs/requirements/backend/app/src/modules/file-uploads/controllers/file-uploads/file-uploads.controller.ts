import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GlobalRole } from '../../../../guards/role.decorator';
import { RoleGlobalGuard } from '../../../../guards/role.guard';
import { UsersGuard } from '../../../../guards/users.guard';
import { FileUploadsConfig } from '../../configs/file-uploads.config';

@Controller('file-uploads')
export class FileUploadsController {

/* */
    /* Public PATHS: anyone can access. */
    /* */
    
    /* */
    /* Public filtered PATHS: anyone can access but connected users would see additional data. */
    /* */

    /* */
    /* Private PATHS: need to be connected and concerned to access. */
    /* */

	@UseGuards(AuthGuard('jwt'))
    @Post(`upload/file`)
    async upload(

    ) {
        return (null);
    }

    /* */
    /* Global PATHS: need to be connected and concerned to access or be admin. It doesn't retrieve user from authentication but from the path itself. */
    /* */

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), UsersGuard || RoleGlobalGuard)
    @Post(`users/:username/upload/file`)
    async myUpload(

    ) {
        return (null);
    }

}
