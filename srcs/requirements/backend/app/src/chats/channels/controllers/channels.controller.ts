import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { ChannelsService } from '../services/channels/channels.service';
import { CreateChannelDto } from '../dtos/CreateChannel.dto';
import { UpdateChannelDto } from '../dtos/UpdateChannel.dto';
import { ReplaceChannelDto } from '../dtos/ReplaceChannel.dto';
import { ParseIdPipe } from 'src/common/pipes/parse-id/parse-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/role/role.guard';
import { Role } from 'src/role/role.decorator';
import { ChannelStatus } from '../entities/Channel.entity';
import { ParseUsernamePipe } from 'src/common/pipes/parse-username/parse-username.pipe';

@Controller()
export class ChannelsController {

    constructor(private channelService: ChannelsService) {}

    /* */
    /* Public PATHS: anyone can access. */
    /* */
    
    /* */
    /* Public filtered PATHS: anyone can access but connected users would see additional data. */
    /* */

    @Get('channels')
    // UseGuard => Verify if user is connected but permit anyone to pass.
    async getChannels(
        @Request() req: any,
        @Query('filterByStatus') filterByStatus?: ChannelStatus,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.getChannels(username, filterByStatus));
    }

    @Get('channels/:channelId')
    // UseGuard => Verify if user is connected but permit anyone to pass.
    async getChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.getChannel(channelId, username));
    }

    @Get('channels/:channelId/members')
    // UseGuard => Verify if user is connected but permit anyone to pass.
    async getChannelMembers(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.getChannel(channelId, username));
    }

    /* */
    /* Private PATHS: need to be connected and concerned to access. */
    /* */

    @Post('channels')
    // UseGuard => Verify if user connected and pass it's req.user
    async createMyChannel(
        @Body(new ValidationPipe) createChannelDto: CreateChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.createChannel(username, createChannelDto));
    }

    @Put('channels/:channelId')
    // UseGuard => Verify if user connected and pass it's req.user
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...)
    async replaceMyChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) replaceChannelDto: ReplaceChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.replaceChannel(channelId, username, replaceChannelDto));
    }

    @Patch('channels/:channelId')
    // UseGuard => Verify if user connected and pass it's req.user
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...)
    async updateMyChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) updateChannelDto: UpdateChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.updateChannel(channelId, username, updateChannelDto));
    }

    @Delete('channels/:channelId')
    // UseGuard => Verify if user connected and pass it's req.user
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...)
    async deleteMyChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.deleteChannel(channelId, username));
    }

    /* */
    /* Global PATHS: need to be connected and concerned to access or be admin. It doesn't retrieve user from authentication but from the path itself. */
    /* */

    @Post('users/:username/channels')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async createChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) createChannelDto: CreateChannelDto,
    ) {
        return (await this.channelService.createChannel(username, createChannelDto));
    }

    @Put('users/:username/channels/:channelId')
    // UseGuard => Verify if user connected and pass it's req.user
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...)
    async replaceChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) replaceChannelDto: ReplaceChannelDto,
    ) {
        return (await this.channelService.replaceChannel(channelId, username, replaceChannelDto));
    }

    @Patch('users/:username/channels/:channelId')
    // UseGuard => Verify if user connected and pass it's req.user
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...)
    async updateChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) updateChannelDto: UpdateChannelDto,
    ) {
        return (await this.channelService.updateChannel(channelId, username, updateChannelDto));
    }

    @Delete('users/:username/channels/:channelId')
    // UseGuard => Verify if user connected and pass it's req.user
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...)
    async deleteChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
    ) {
        return (await this.channelService.deleteChannel(channelId, username));
    }

    /* */
    /* Front-end PATHS: need to be sent via front-end and verified via a jwt key. */
    /* */

    /*
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
    */

}
