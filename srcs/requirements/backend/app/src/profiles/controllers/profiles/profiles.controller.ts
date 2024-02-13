import { Body, Controller, Get, Param, ParseIntPipe, Patch, Put, ValidationPipe } from '@nestjs/common';
import { ParseBigIntPipe } from 'src/common/pipes/parsebigint/parsebigint.pipe';
import { ReplaceProfileDto } from 'src/profiles/dtos/ReplaceProfile.dto';
import { UpdateProfileDto } from 'src/profiles/dtos/UpdateProfile.dto';
import { ProfilesService } from 'src/profiles/services/profiles/profiles.service';

@Controller('users/:userId/profile')
export class ProfilesController {

    constructor(private readonly profileService: ProfilesService) {}

    @Get()
    async getProfile(@Param('userId', ParseBigIntPipe) userId: bigint) {
        return (await this.profileService.getProfileByUserId(userId));
    }

    @Put()
    async replaceProfile(
        @Param('userId', ParseBigIntPipe) userId: bigint,
        @Body(new ValidationPipe) replaceProfileDto: ReplaceProfileDto
    ) {
        return (await this.profileService.replaceProfile(userId, replaceProfileDto));
    }

    @Patch()
    async updateProfile(
        @Param('userId', ParseBigIntPipe) userId: bigint,
        @Body(new ValidationPipe) updateProfileDto: UpdateProfileDto
    ) {
        return (await this.profileService.updateProfile(userId, updateProfileDto));
    }

}
