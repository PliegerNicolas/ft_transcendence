import { Body, Controller, Delete, Get, Param, Patch, Put, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ParseIdPipe } from 'src/common/pipes/parse-id/parse-id.pipe';
import { ParseUsernamePipe } from 'src/common/pipes/parse-username/parse-username.pipe';
import { ReplaceProfileDto } from 'src/profiles/dtos/ReplaceProfile.dto';
import { UpdateProfileDto } from 'src/profiles/dtos/UpdateProfile.dto';
import { ProfilesService } from 'src/profiles/services/profiles/profiles.service';
import { GlobalRole } from 'src/guards/role.decorator';
import { RoleGlobalGuard } from 'src/guards/role.guard';
import { UsersGuard } from 'src/guards/users.guard';

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

	@UseGuards(AuthGuard('jwt'))
    @Put('me/profile')
    // UseGuard => Verify if user connected and pass it's req.user
    async replaceMyProfile(
        @Body(new ValidationPipe) replaceProfileDto: ReplaceProfileDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.profileService.replaceProfile(username, replaceProfileDto));
    }

	@UseGuards(AuthGuard('jwt'))
    @Patch('me/profile')
    // UseGuard => Verify if user connected and pass it's req.user
    async updateMyProfile(
        @Body(new ValidationPipe) updateProfileDto: UpdateProfileDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.profileService.updateProfile(username, updateProfileDto));
    }

	@UseGuards(AuthGuard('jwt'))
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

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), UsersGuard || RoleGlobalGuard)
    @Put('users/:username/profile')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async replaceProfile(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) replaceProfileDto: ReplaceProfileDto,
    ) {
        return (await this.profileService.replaceProfile(username, replaceProfileDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), UsersGuard || RoleGlobalGuard)
    @Patch('users/:username/profile')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async updateProfile(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) updateProfileDto: UpdateProfileDto,
    ) {
        return (await this.profileService.updateProfile(username, updateProfileDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), UsersGuard || RoleGlobalGuard)
    @Delete('users/:username/profile')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async clearProfile(
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        return (await this.profileService.clearProfile(username));
    }

}
