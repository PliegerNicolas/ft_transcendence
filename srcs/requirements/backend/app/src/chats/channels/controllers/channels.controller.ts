import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { ChannelsService } from '../services/channels/channels.service';
import { CreateChannelDto } from '../dtos/CreateChannel.dto';
import { UpdateChannelDto } from '../dtos/UpdateChannel.dto';
import { ReplaceChannelDto } from '../dtos/ReplaceChannel.dto';
import { ParseIdPipe } from 'src/common/pipes/parse-id/parse-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/role/role.guard';
import { Role } from 'src/role/role.decorator';

@Controller()
export class ChannelsController {

    constructor(private channelService: ChannelsService) {}

    @Get('channels')
    async getChannels() {
        // Should pass userId (if user is connected and passport validated or null)
        // For this moment userId is passed as 2.
        return (await this.channelService.getChannels(BigInt(1)));
    }

    @Get('channels/:channelId')
    async getChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint
    ) {
        // Should pass userId (if user is connected and passport validated or null).
        // For this moment userId is passed as 2.
        return (await this.channelService.getChannel(BigInt(1), channelId));
    }

    @Get('channels/:channelId/members')
    async getChannelMembers(
        @Param('channelId', ParseIdPipe) channelId: bigint
    ) {
        // Should pass userId (if user is connected and passport validated or null).
        // For this moment userId is passed as 2.
        return (await this.channelService.getChannelMembers(BigInt(1), channelId));
    }

	@UseGuards(AuthGuard('jwt'))
    @Post('channels')
    async createChannel(
        @Body(new ValidationPipe) createChannelDto: CreateChannelDto,
		@Request() req: any
    ) {
        // For this moment userId is passed as 1. Need passport to set a significant value.
        const userId = req.user ? BigInt(req.user.id) : null;
        return (await this.channelService.createChannel(userId, createChannelDto));
    }

	@UseGuards(AuthGuard('jwt'))
    @Put('channels/:channelId')
    async replaceChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) replaceChannelDto: ReplaceChannelDto,
		@Request() req: any
    ) {
        // For this moment userId is passed as 1. Need passport.
        const userId = req.user ? BigInt(req.user.id) : null;
        return (await this.channelService.replaceChannel(userId, channelId, replaceChannelDto));
    }

	@UseGuards(AuthGuard('jwt'))
    @Patch('channels/:channelId')
    async updateChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) updateChannelDto: UpdateChannelDto,
		@Request() req: any
    ) {
        // For this moment userId is passed as 1. Need passport.
        const userId = req.user ? BigInt(req.user.id) : null;
        return (await this.channelService.updateChannel(userId, channelId, updateChannelDto));
    }

	@UseGuards(AuthGuard('jwt'))
    @Patch('channels/:channelId/join')
    async joinChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
		@Request() req: any
    ) {
        // For this moment userId is passed as 2. Need passport.
        const userId = req.user ? BigInt(req.user.id) : null;
        return (await this.channelService.joinChannel(userId, channelId));
    }

	@UseGuards(AuthGuard('jwt'))
    @Patch('channels/:channelId/leave')
    async leaveChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
		@Request() req: any
    ) {
        // For this moment userId is passed as 2. Need passport.
        const userId = req.user ? BigInt(req.user.id) : null;
        return (await this.channelService.leaveChannel(userId, channelId));
    }

	@Role(['admin'])
	@UseGuards(AuthGuard('jwt'), RoleGuard)
    @Delete('channels/:channelId')
    async deleteChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
		@Request() req: any
	) {
        // For this moment userId is passed as 2. Need passport.
        const userId = BigInt(req.user?.id);
        return (await this.channelService.deleteChannel(userId, channelId));
    }

}
