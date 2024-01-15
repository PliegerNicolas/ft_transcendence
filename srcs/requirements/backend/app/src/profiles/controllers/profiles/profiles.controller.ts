import { Body, Controller, Get, Param, ParseIntPipe, Patch, Put, ValidationPipe } from '@nestjs/common';
import { ReplaceProfileDto } from 'src/profiles/dtos/ReplaceProfile.dto';
import { UpdateProfileDto } from 'src/profiles/dtos/UpdateProfile.dto';
import { ProfilesService } from 'src/profiles/services/profiles/profiles.service';

@Controller('users/:userId/profile')
export class ProfilesController {

    constructor(private readonly profileService: ProfilesService) {}

    @Get()
    async getProfile(@Param('userId', ParseIntPipe) userId: number) {
        return (await this.profileService.getProfileByUserId(userId));
    }

    @Put()
    async replaceProfile(
        @Param('userId', ParseIntPipe) userId: number,
        @Body(new ValidationPipe) replaceProfileDto: ReplaceProfileDto
    ) {
        return (await this.profileService.replaceProfile(userId, replaceProfileDto));
    }

    @Patch()
    async updateProfile(
        @Param('userId', ParseIntPipe) userId: number,
        @Body(new ValidationPipe) updateProfileDto: UpdateProfileDto
    ) {
        return (await this.profileService.updateProfile(userId, updateProfileDto));
    }

}
