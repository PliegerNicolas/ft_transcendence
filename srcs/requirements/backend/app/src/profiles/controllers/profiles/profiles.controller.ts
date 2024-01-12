import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CreateProfileDto } from 'src/profiles/dtos/CreateProfileDto';
import { UpdateProfileDto } from 'src/profiles/dtos/UpdateProfileDto';
import { ProfilesService } from 'src/profiles/services/profiles/profiles.service';

@Controller('profiles')
export class ProfilesController {

    constructor(private profileService: ProfilesService) {}

    @Get(':id')
    getProfile(@Param('id', ParseIntPipe) id: number) {
        return (this.profileService.getProfile(id));
    }

    @Post()
    createProfile(@Body() createProfileDto: CreateProfileDto) {
        return (this.profileService.createProfile(createProfileDto));
    }

    @Put(':id')
    updateProfile(@Param('id', ParseIntPipe) id: number, @Body() updateProfileDto: UpdateProfileDto) {
        return (this.profileService.updateProfile(id, updateProfileDto));
    }

    @Delete(':id')
    deleteProfile(@Param('id', ParseIntPipe) id: number) {
      return this.profileService.deleteProfile(id);
    }

}
