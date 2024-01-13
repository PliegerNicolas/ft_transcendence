import { Body, Controller, Get, Param, ParseIntPipe, Patch, Put } from '@nestjs/common';
import { UpdateProfileDto } from 'src/profiles/dtos/UpdateProfileDto';
import { ProfilesService } from 'src/profiles/services/profiles/profiles.service';

@Controller('users/:userId/profile')
export class ProfilesController {

    constructor(private readonly profileService: ProfilesService) {}

    @Get()
    async getProfile(@Param('userId', ParseIntPipe) userId: number) {
        return (await this.profileService.getProfileByUserId(userId));
    }

    @Patch()
    async updateProfile(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() updateProfileDto: UpdateProfileDto
    ) {
        await this.profileService.updateProfile(userId, updateProfileDto);
    }

}
