import { Controller, Delete, Get, Param, Post, Put, Request, Res, UnprocessableEntityException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfilePicturesService } from '../../services/profile-pictures/profile-pictures.service';
import { ParseUsernamePipe } from '../../../../common/pipes/parse-username/parse-username.pipe';
import { AuthGuard } from '@nestjs/passport';
import { GlobalRole } from '../../../../guards/role.decorator';
import { UsersGuard } from '../../../../guards/users.guard';
import { RoleGlobalGuard } from '../../../../guards/role.guard';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { File } from 'src/modules/file-uploads/entities/file.entity';

@Controller()
export class ProfilePicturesController {

    constructor(
        private readonly profilePictureService: ProfilePicturesService,
    ) {}

    /* */
    /* Public PATHS: anyone can access. */
    /* */

    @Get('users/:username/profile/picture')
    async getProfilePicture(
        @Param('username', ParseUsernamePipe) username: string,
        @Res() res: Response,
    ) {
        const picture = await this.profilePictureService.getProfilePicture(username);
        this.sendResponse(res, picture);
    }

    /* */
    /* Public filtered PATHS: anyone can access but connected users would see additional data. */
    /* */

    /* */
    /* Private PATHS: need to be connected and concerned to access. */
    /* */

	@UseGuards(AuthGuard('jwt'))
    @Get('profile/picture')
    async getMyProfilePicture(
        @Request() req: any,
        @Res() res: Response,
    ) {
        const username = req.user ? req.user.username : undefined;
        const picture = await this.profilePictureService.getProfilePicture(username);
        this.sendResponse(res, picture);
    }

	@UseGuards(AuthGuard('jwt'))
    @Post('profile/picture')
    @UseInterceptors(FileInterceptor('picture'))
    async createMyProfilePicture(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any,
        @Res() res: Response,
    ) {
        const username = req.user ? req.user.username : undefined;
        const picture = await this.profilePictureService.createProfilePicture(username, file);
        this.sendResponse(res, picture);
    }

	@UseGuards(AuthGuard('jwt'))
    @Put('profile/picture')
    @UseInterceptors(FileInterceptor('picture'))
    async replaceMyProfilePicture(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any,
        @Res() res: Response,
    ) {
        const username = req.user ? req.user.username : undefined;
        const picture = await this.profilePictureService.replaceProfilePicture(username, file);
        this.sendResponse(res, picture);
    }

	@UseGuards(AuthGuard('jwt'))
    @Delete('profile/picture')
    async deleteMyProfilePicture(
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.profilePictureService.deleteProfilePicture(username));
    }

    /* */
    /* Global PATHS: need to be connected and concerned to access or be admin. It doesn't retrieve user from authentication but from the path itself. */
    /* */

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), UsersGuard || RoleGlobalGuard)
    @Post('users/:username/profile/picture')
    @UseInterceptors(FileInterceptor('picture'))
    async createProfilePicture(
        @UploadedFile() file: Express.Multer.File,
        @Param('username', ParseUsernamePipe) username: string,
        @Res() res: Response,
    ) {
        const picture = await this.profilePictureService.createProfilePicture(username, file);
        this.sendResponse(res, picture);
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), UsersGuard || RoleGlobalGuard)
    @Put('users/:username/profile/picture')
    @UseInterceptors(FileInterceptor('picture'))
    async replaceProfilePicture(
        @UploadedFile() file: Express.Multer.File,
        @Param('username', ParseUsernamePipe) username: string,
        @Res() res: Response,
    ) {
        const picture = await this.profilePictureService.replaceProfilePicture(username, file);
        this.sendResponse(res, picture);
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), UsersGuard || RoleGlobalGuard)
    @Delete('users/:username/profile/picture')
    async deleteProfilePicture(
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        return (await this.profilePictureService.deleteProfilePicture(username));
    }

    /* Helper Functions */

    private sendResponse(res: Response, file: File) {
        try {
            res.set('Content-Type', file.mimetype);
            res.set('Content-Length', file.size.toString());
            res.set('Content-Disposition', `inline; filename="${file.originalname}"`);
    
            res.sendFile(file.path, { root: '.' });
        } catch(error) {
            throw new UnprocessableEntityException('Error while handling profile picture');
        }
    }

}
