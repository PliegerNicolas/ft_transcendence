import { Body, Controller, Get, Param, Patch, Put, ValidationPipe } from '@nestjs/common';
import { ParseIdPipe } from 'src/common/pipes/parseid/parseid.pipe';
import { ReplaceProfileDto } from 'src/profiles/dtos/ReplaceProfile.dto';
import { UpdateProfileDto } from 'src/profiles/dtos/UpdateProfile.dto';
import { ProfilesService } from 'src/profiles/services/profiles/profiles.service';

@Controller('users/:userId/profile')
export class ProfilesController {

    constructor(private readonly profileService: ProfilesService) {}

    @Get()
    async getProfile(@Param('userId', ParseIdPipe) userId: bigint) {
        return (await this.profileService.getProfileByUserId(userId));
    }

    @Put()
    async replaceProfile(
        @Param('userId', ParseIdPipe) userId: bigint,
        @Body(new ValidationPipe) replaceProfileDto: ReplaceProfileDto
    ) {
        return (await this.profileService.replaceProfile(userId, replaceProfileDto));
    }

    @Patch()
    async updateProfile(
        @Param('userId', ParseIdPipe) userId: bigint,
        @Body(new ValidationPipe) updateProfileDto: UpdateProfileDto
    ) {
        return (await this.profileService.updateProfile(userId, updateProfileDto));
    }

}
