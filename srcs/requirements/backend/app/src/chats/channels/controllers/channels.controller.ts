import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards, ValidationPipe } from '@nestjs/common';
import { ChannelsService } from '../services/channels/channels.service';
import { CreateChannelDto } from '../dtos/CreateChannel.dto';
import { UpdateChannelDto } from '../dtos/UpdateChannel.dto';
import { ReplaceChannelDto } from '../dtos/ReplaceChannel.dto';
import { ParseIdPipe } from 'src/common/pipes/parse-id/parse-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/role/role.guard';

@Controller()
export class ChannelsController {

    constructor(private channelService: ChannelsService) {}

    @Get('channels')
    async getChannels() {
        // Should pass userId (if user is connected and passport validated or null)
        // For this moment userId is passed as 2.
        return (await this.channelService.getChannels(BigInt(2)));
    }

    @Get('channels/:channelId')
    async getChannel(@Param('channelId', ParseIdPipe) channelId: bigint,) {
        // Should pass userId (if user is connected and passport validated or null).
        // For this moment userId is passed as 2.
        return (await this.channelService.getChannel(BigInt(1), channelId));
    }

    @Get('channels/:channelId/members')
    async getChannelMembers(@Param('channelId', ParseIdPipe) channelId: bigint,) {
        // Should pass userId (if user is connected and passport validated or null).
        // For this moment userId is passed as 2.
        return (await this.channelService.getChannelMembers(BigInt(2), channelId));
    }

	//@UseGuards(AuthGuard('jwt'))
    @Post('channels')
    async createChannel(
        @Body(new ValidationPipe) createChannelDto: CreateChannelDto
    ) {
        // For this moment userId is passed as 1. Need passport to set a significant value.
        return (await this.channelService.createChannel(BigInt(1), createChannelDto));
    }

	//@UseGuards(AuthGuard('jwt'))
    @Put('channels/:channelId')
    async replaceChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) replaceChannelDto: ReplaceChannelDto
    ) {
        // For this moment userId is passed as 1. Need passport.
        return (await this.channelService.replaceChannel(BigInt(1), channelId, replaceChannelDto));
    }

	//@UseGuards(AuthGuard('jwt'))
    @Patch('channels/:channelId')
    async updateChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) updateChannelDto: UpdateChannelDto
    ) {
        // For this moment userId is passed as 1. Need passport.
        return (await this.channelService.updateChannel(BigInt(1), channelId, updateChannelDto));
    }

	//@UseGuards(AuthGuard('jwt'))
    @Patch('channels/:channelId/join')
    async joinChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
    ) {
        // For this moment userId is passed as 2. Need passport.
        return (await this.channelService.joinChannel(BigInt(2), channelId));
    }

	//@UseGuards(AuthGuard('jwt'))
    @Patch('channels/:channelId/leave')
    async leaveChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
    ) {
        // For this moment userId is passed as 2. Need passport.
        return (await this.channelService.leaveChannel(BigInt(2), channelId));
    }

	//@UseGuards(AuthGuard('jwt'))
    @Delete('channels/:channelId')
    async deleteChannel(@Param('channelId', ParseIdPipe) channelId: bigint) {
        // For this moment userId is passed as 2. Need passport.
        return (await this.channelService.deleteChannel(BigInt(2), channelId));
    }

}
