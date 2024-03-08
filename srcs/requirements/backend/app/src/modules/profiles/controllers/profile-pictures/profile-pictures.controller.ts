import { Controller, Delete, Get, Param, Post, Put, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfilePicturesService } from '../../services/profile-pictures/profile-pictures.service';
import { ParseUsernamePipe } from '../../../../common/pipes/parse-username/parse-username.pipe';
import { AuthGuard } from '@nestjs/passport';
import { GlobalRole } from '../../../../guards/role.decorator';
import { UsersGuard } from '../../../../guards/users.guard';
import { RoleGlobalGuard } from '../../../../guards/role.guard';
import { Response } from 'express';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

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
        return (await this.profilePictureService.getProfilePicture());
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
        return (await this.profilePictureService.getProfilePicture());
    }

	@UseGuards(AuthGuard('jwt'))
    @Post('profile/picture')
    @UseInterceptors(FileInterceptor('picture'))
    async createMyProfilePicture(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.profilePictureService.createProfilePicture());
    }

	@UseGuards(AuthGuard('jwt'))
    @Put('profile/picture')
    @UseInterceptors(FileInterceptor('picture'))
    async replaceMyProfilePicture(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.profilePictureService.replaceProfilePicture());
    }

	@UseGuards(AuthGuard('jwt'))
    @Delete('profile/picture')
    async deleteMyProfilePicture(
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.profilePictureService.deleteProfilePicture());
    }

    /* */
    /* Global PATHS: need to be connected and concerned to access or be admin. It doesn't retrieve user from authentication but from the path itself. */
    /* */

	//@GlobalRole(['operator'])
	//@UseGuards(AuthGuard('jwt'), UsersGuard || RoleGlobalGuard)
    @Post('users/:username/profile/picture')
    @UseInterceptors(FileInterceptor('picture'))
    async createProfilePicture(
        @UploadedFile() file: Express.Multer.File,
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        console.log(file);
        return (await this.profilePictureService.createProfilePicture());
    }

	//@GlobalRole(['operator'])
	//@UseGuards(AuthGuard('jwt'), UsersGuard || RoleGlobalGuard)
    @Put('users/:username/profile/picture')
    @UseInterceptors(FileInterceptor('picture'))
    async replaceProfilePicture(
        @UploadedFile() file: Express.Multer.File,
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        return (await this.profilePictureService.replaceProfilePicture());
    }

	//@GlobalRole(['operator'])
	//@UseGuards(AuthGuard('jwt'), UsersGuard || RoleGlobalGuard)
    @Delete('users/:username/profile/picture')
    async deleteProfilePicture(
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        return (await this.profilePictureService.deleteProfilePicture());
    }

}
