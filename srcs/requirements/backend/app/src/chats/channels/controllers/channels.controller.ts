import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, ValidationPipe } from '@nestjs/common';
import { ChannelsService } from '../services/channels/channels.service';
import { CreateChannelDto } from '../dtos/CreateChannel.dto';
import { UpdateChannelDto } from '../dtos/UpdateChannel.dto';
import { ReplaceChannelDto } from '../dtos/ReplaceChannel.dto';

@Controller()
export class ChannelsController {

    constructor(private channelService: ChannelsService) {}

    @Get('channels')
    async getChannels() {
        // Should pass userId (if user is connected and passport validated or null)
        // For this moment userId is passed as 1.
        return (await this.channelService.getChannels(1));
    }

    @Get('channels/:channelId/members')
    async getChannelMembers(@Param('channelId', ParseIntPipe) channelId: number,) {
        // Should pass userId (if user is connected and passport validated or null).
        // For this moment userId is passed as 1.
        return (await this.channelService.getChannelMembers(1, channelId));
    }

    @Post('channels')
    async createChannel(
        @Body(new ValidationPipe) createChannelDto: CreateChannelDto
    ) {
        // For this moment userId is passed as 1. Need passport to set a significant value.
        return (await this.channelService.createChannel(1, createChannelDto));
    }

    @Put('channels/:channelId')
    async replaceChannel(
        @Param('channelId', ParseIntPipe) channelId: number,
        @Body(new ValidationPipe) replaceChannelDto: ReplaceChannelDto
    ) {
        // For this moment userId is passed as 1. Need passport.
        return (await this.channelService.replaceChannel(1, channelId, replaceChannelDto));
    }

    @Patch('channels/:channelId')
    async updateChannel(
        @Param('channelId', ParseIntPipe) channelId: number,
        @Body(new ValidationPipe) updateChannelDto: UpdateChannelDto
    ) {
        // For this moment userId is passed as 1. Need passport.
        return (await this.channelService.updateChannel(1, channelId, updateChannelDto));
    }

    @Patch('channels/:channelId/join')
    async joinChannel(
        @Param('channelId', ParseIntPipe) channelId: number,
    ) {
        // For this moment userId is passed as 2. Need passport.
        return (await this.channelService.joinChannel(2, channelId));
    }

    @Patch('channels/:channelId/leave')
    async leaveChannel(
        @Param('channelId', ParseIntPipe) channelId: number,
    ) {
        // For this moment userId is passed as 2. Need passport.
        return (await this.channelService.leaveChannel(2, channelId));
    }

    @Delete('channels/:channelId')
    async deleteChannel(@Param('channelId', ParseIntPipe) channelId: number) {
        // For this moment userId is passed as 2. Need passport.
        return (await this.channelService.deleteChannel(2, channelId));
    }

}
