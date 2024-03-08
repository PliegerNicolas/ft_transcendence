import { Controller, Delete, Get, Param, Post, Put, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PicturesService } from '../../services/pictures/pictures.service';
import { ParseUsernamePipe } from '../../../../common/pipes/parse-username/parse-username.pipe';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { GlobalRole } from '../../../../guards/role.decorator';
import { UsersGuard } from '../../../../guards/users.guard';
import { RoleGlobalGuard } from '../../../../guards/role.guard';

@Controller()
export class PicturesController {

    constructor(
        private readonly pictureService: PicturesService,
    ) {}

    /* */
    /* Public PATHS: anyone can access. */
    /* */

    @Get('users/:username/picture')
    async getPicture(
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        return ((await this.pictureService.getPicture(username)).path);
    }

    /* */
    /* Public filtered PATHS: anyone can access but connected users would see additional data. */
    /* */

    /* */
    /* Private PATHS: need to be connected and concerned to access. */
    /* */

	@UseGuards(AuthGuard('jwt'))
    @Get('/picture')
    async getMyPicture(
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return ((await this.pictureService.getPicture(username)).path);
    }

	@UseGuards(AuthGuard('jwt'))
    @Post('picture')
    @UseInterceptors(FileInterceptor('picture'))
    async createMyPicture(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return ((await this.pictureService.createPicture(username, file)).path);
    }

	@UseGuards(AuthGuard('jwt'))
    @Put('picture')
    @UseInterceptors(FileInterceptor('picture'))
    async replaceMyPicture(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return ((await this.pictureService.replacePicture(username, file)).path);
    }

	@UseGuards(AuthGuard('jwt'))
    @Delete('picture')
    async deleteMyPicture(
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.pictureService.deletePicture(username));
    }

    /* */
    /* Global PATHS: need to be connected and concerned to access or be admin. It doesn't retrieve user from authentication but from the path itself. */
    /* */

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), UsersGuard || RoleGlobalGuard)
    @Post('users/:username/picture')
    @UseInterceptors(FileInterceptor('picture'))
    async createPicture(
        @UploadedFile() file: Express.Multer.File,
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        return ((await this.pictureService.createPicture(username, file)).path);
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), UsersGuard || RoleGlobalGuard)
    @Put('users/:username/picture')
    @UseInterceptors(FileInterceptor('picture'))
    async replacePicture(
        @UploadedFile() file: Express.Multer.File,
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        return ((await this.pictureService.replacePicture(username, file)).path);
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), UsersGuard || RoleGlobalGuard)
    @Delete('users/:username/picture')
    async deletePicture(
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        return (await this.pictureService.deletePicture(username));
    }

    /* Helper Functions */

    /*
    private sendResponse(res: Response, file: File) {
        try {
            res.set('Content-Type', file.mimetype);
            res.set('Content-Length', file.size.toString());
            res.set('Content-Disposition', `inline; filename="${file.originalname}"`);
    
            res.sendFile(file.path, { root: '.' });
        } catch(error) {
            throw new UnprocessableEntityException('Error while handling user's picture');
        }
    }
    */
}
