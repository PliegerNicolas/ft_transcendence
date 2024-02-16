import { Body, Controller, Get, Param, Patch, Put, ValidationPipe } from '@nestjs/common';
import { ParseIdPipe } from 'src/common/pipes/parse-id/parse-id.pipe';
import { ParseUsernamePipe } from 'src/common/pipes/parse-username/parse-username.pipe';
import { ReplaceProfileDto } from 'src/profiles/dtos/ReplaceProfile.dto';
import { UpdateProfileDto } from 'src/profiles/dtos/UpdateProfile.dto';
import { ProfilesService } from 'src/profiles/services/profiles/profiles.service';

@Controller('users/:username/profile')
export class ProfilesController {

    constructor(private readonly profileService: ProfilesService) {}

    @Get()
    async getProfile(@Param('username', ParseUsernamePipe) username: string) {
        return (await this.profileService.getProfileByUserId(username));
    }

    @Put()
    async replaceProfile(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) replaceProfileDto: ReplaceProfileDto
    ) {
        return (await this.profileService.replaceProfile(username, replaceProfileDto));
    }

    @Patch()
    async updateProfile(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) updateProfileDto: UpdateProfileDto
    ) {
        return (await this.profileService.updateProfile(username, updateProfileDto));
    }

}
