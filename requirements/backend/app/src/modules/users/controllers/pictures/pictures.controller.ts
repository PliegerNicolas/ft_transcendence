import { Controller, Delete, Get, Param, Post, Put, Request, Res, UnprocessableEntityException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PicturesService } from '../../services/pictures/pictures.service';
import { ParseUsernamePipe } from '../../../../common/pipes/parse-username/parse-username.pipe';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { GlobalRole } from '../../../../guards/role.decorator';
import { UsersGuard } from '../../../../guards/users.guard';
import { RoleGlobalGuard } from '../../../../guards/role.guard';
import { File } from 'src/modules/file-uploads/entities/file.entity';
import { Response } from 'express';
import { Serialize } from 'src/common/serialization/decorators/serialize/serialize.decorator';

@Controller()
@Serialize()
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
        @Res() res: Response,
    ) {
        const picture = await this.pictureService.getPicture(username);
        this.sendResponse(res, picture);
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
        @Res() res: Response,
    ) {
        const username = req.user ? req.user.username : undefined;
        const picture = await this.pictureService.getPicture(username);
        this.sendResponse(res, picture);
    }

	@UseGuards(AuthGuard('jwt'))
    @Post('picture')
    @UseInterceptors(FileInterceptor('picture'))
    async createMyPicture(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any,
        @Res() res: Response,
    ) {
        const username = req.user ? req.user.username : undefined;
        const picture = await this.pictureService.createPicture(username, file);
        this.sendResponse(res, picture);
    }

	@UseGuards(AuthGuard('jwt'))
    @Put('picture')
    @UseInterceptors(FileInterceptor('picture'))
    async replaceMyPicture(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any,
        @Res() res: Response,
    ) {
        const username = req.user ? req.user.username : undefined;
        const picture = await this.pictureService.replacePicture(username, file);
        this.sendResponse(res, picture);
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
        @Res() res: Response,
    ) {
        const picture = await this.pictureService.createPicture(username, file);
        this.sendResponse(res, picture);
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), UsersGuard || RoleGlobalGuard)
    @Put('users/:username/picture')
    @UseInterceptors(FileInterceptor('picture'))
    async replacePicture(
        @UploadedFile() file: Express.Multer.File,
        @Param('username', ParseUsernamePipe) username: string,
        @Res() res: Response,
    ) {
        const picture = await this.pictureService.replacePicture(username, file);
        this.sendResponse(res, picture);
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

    private sendResponse(res: Response, picture: File) {
        try {
            res.set('Content-Type', picture.mimetype);
            res.set('Content-Length', picture.size.toString());
            res.set('Content-Disposition', `inline; filename="${picture.originalname}"`);
    
            res.sendFile(picture.path, { root: '.' });
        } catch(error) {
            throw new UnprocessableEntityException(`Error while handling user's picture`);
        }
    }
}
