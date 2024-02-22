import { Body, Controller, Delete, Get, Param, Patch, Put, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ParseIdPipe } from 'src/common/pipes/parse-id/parse-id.pipe';
import { ParseUsernamePipe } from 'src/common/pipes/parse-username/parse-username.pipe';
import { ReplaceProfileDto } from 'src/profiles/dtos/ReplaceProfile.dto';
import { UpdateProfileDto } from 'src/profiles/dtos/UpdateProfile.dto';
import { ProfilesService } from 'src/profiles/services/profiles/profiles.service';

@Controller()
export class ProfilesController {

    constructor(private readonly profileService: ProfilesService) {}

    /* */
    /* Public PATHS: anyone can access. */
    /* */

    /* */
    /* Public filtered PATHS: anyone can access but connected users would see additional data. */
    /* */

    /* */
    /* Private PATHS: need to be connected and concerned to access. */
    /* */

    @Put('me/profile')
    // UseGuard => Verify if user connected and pass it's req.user
    async replaceMyProfile(
        @Body(new ValidationPipe) replaceProfileDto: ReplaceProfileDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.profileService.replaceProfile(username, replaceProfileDto));
    }

    @Patch('me/profile')
    // UseGuard => Verify if user connected and pass it's req.user
    async updateMyProfile(
        @Body(new ValidationPipe) updateProfileDto: UpdateProfileDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.profileService.updateProfile(username, updateProfileDto));
    }

    @Delete('me/profile')
    // UseGuard => Verify if user connected and pass it's req.user
    async clearMyprofile(
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.profileService.clearProfile(username));
    }

    /* */
    /* Global PATHS: need to be connected and concerned to access or be admin. It doesn't retrieve user from authentication but from the path itself. */
    /* */

    @Put('users/:username/profile')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async replaceProfile(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) replaceProfileDto: ReplaceProfileDto,
    ) {
        return (await this.profileService.replaceProfile(username, replaceProfileDto));
    }

    @Patch('users/:username/profile')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async updateProfile(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) updateProfileDto: UpdateProfileDto,
    ) {
        return (await this.profileService.updateProfile(username, updateProfileDto));
    }

    @Delete('users/:username/profile')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async clearProfile(
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        return (await this.profileService.clearProfile(username));
    }

}
