import { Body, Controller, Delete, Param, Patch, Put, Request, UseGuards, ValidationPipe } from "@nestjs/common";
import { ProfilesService } from "../../services/profiles/profiles.service";
import { ReplaceProfileDto } from "../../dtos/ReplaceProfile.dto";
import { UpdateProfileDto } from "../../dtos/UpdateProfile.dto";
import { ParseUsernamePipe } from "../../../../common/pipes/parse-username/parse-username.pipe";
import { AuthGuard } from "@nestjs/passport";
import { GlobalRole } from "../../../../guards/role.decorator";
import { UsersGuard } from "../../../../guards/users.guard";
import { RoleGlobalGuard } from "../../../../guards/role.guard";
import { Serialize } from "src/common/serialization/decorators/serialize/serialize.decorator";

@Controller()
@Serialize()
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

    @UseGuards(AuthGuard('jwtTwoFactor'))
    @Put('profile')
    // UseGuard => Verify if user connected and pass it's req.user
    async replaceMyProfile(
        @Body(new ValidationPipe) replaceProfileDto: ReplaceProfileDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.profileService.replaceProfile(username, replaceProfileDto));
    }


    @UseGuards(AuthGuard('jwtTwoFactor'))
    @Patch('profile')
    // UseGuard => Verify if user connected and pass it's req.user
    async updateMyProfile(
        @Body(new ValidationPipe) updateProfileDto: UpdateProfileDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.profileService.updateProfile(username, updateProfileDto));
    }

    @UseGuards(AuthGuard('jwtTwoFactor'))
    @Delete('profile')
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
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Put('users/:username/profile')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async replaceProfile(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) replaceProfileDto: ReplaceProfileDto,
    ) {
        return (await this.profileService.replaceProfile(username, replaceProfileDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Patch('users/:username/profile')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async updateProfile(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) updateProfileDto: UpdateProfileDto,
    ) {
        return (await this.profileService.updateProfile(username, updateProfileDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Delete('users/:username/profile')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async clearProfile(
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        return (await this.profileService.clearProfile(username));
    }

}
