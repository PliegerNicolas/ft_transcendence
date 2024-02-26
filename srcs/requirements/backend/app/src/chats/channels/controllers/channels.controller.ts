import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { ChannelsService } from '../services/channels/channels.service';
import { ParseIdPipe } from 'src/common/pipes/parse-id/parse-id.pipe';
import { GetChannelsQueryDto } from '../dtos/GetChannelsQuery.dto';
import { CreateChannelDto } from '../dtos/CreateChannel.dto';
import { ParseUsernamePipe } from 'src/common/pipes/parse-username/parse-username.pipe';
import { ReplaceChannelDto } from '../dtos/ReplaceChannel.dto';
import { UpdateChannelDto } from '../dtos/UpdateChannel.dto';
import { GetChannelDto } from '../dtos/GetChannel.dto';
import { JoinChannelDto } from '../dtos/JoinChannel.dto';
import { LeaveChannelDto } from '../dtos/LeaveChannel.dto';
import { ChannelAccessDto } from '../dtos/ChannelAccess.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/role/role.guard';
import { Role } from 'src/role/role.decorator';

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
    async getMyChannels(
        @Query(new ValidationPipe({ transform: true, whitelist: true })) queryDto: GetChannelsQueryDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.getChannels(username, queryDto));
    }

    @Get('channels/:channelId')
    // UseGuard => Verify if user is connected but permit anyone to pass.
    async getMyChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) getChannelDto: GetChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.getChannel(channelId, username, getChannelDto));
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
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async replaceMyChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) replaceChannelDto: ReplaceChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.replaceChannel(channelId, username, replaceChannelDto));
    }

    @Patch('channels/:channelId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async updateMyChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) updateChannelDto: UpdateChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.updateChannel(channelId, username, updateChannelDto));
    }

    @Patch('channels/:channelId/join')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async joinMyChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) joinChannelDto: JoinChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.joinChannel(channelId, username, joinChannelDto));
    }

    @Patch('channels/:channelId/leave')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async leaveMyChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) leaveChannelDto: LeaveChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.leaveChannel(channelId, username, leaveChannelDto));
    }

    @Patch('channels/:channelId/manage_access')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...) ?
    async manageMyChannelAccess(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) channelAccessDto: ChannelAccessDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.manageChannelAccess(channelId, username, channelAccessDto));
    }

	@Role(['admin'])
	@UseGuards(AuthGuard('jwt'), RoleGuard)
    @Delete('channels/:channelId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...) ?
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

    @Get('users/:username/channels')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async getChannels(
        @Param('username', ParseUsernamePipe) username: string,
        @Query(new ValidationPipe({ transform: true, whitelist: true })) queryDto: GetChannelsQueryDto,
    ) {
        return (await this.channelService.getChannels(username, queryDto));
    }

    @Get('users/:username/channels/:channelId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async getChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) getChannelDto: GetChannelDto,
    ) {
        return (await this.channelService.getChannel(channelId, username, getChannelDto));
    }

    @Post('users/:username/channels')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async createChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) createChannelDto: CreateChannelDto,
    ) {
        return (await this.channelService.createChannel(username, createChannelDto));
    }

    @Put('users/:username/channels/:channelId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...) ?
    async replaceChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) replaceChannelDto: ReplaceChannelDto,
    ) {
        return (await this.channelService.replaceChannel(channelId, username, replaceChannelDto));
    }

    @Patch('users/:username/channels/:channelId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...) ?
    async updateChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) updateChannelDto: UpdateChannelDto,
    ) {
        return (await this.channelService.updateChannel(channelId, username, updateChannelDto));
    }

    @Patch('users/:username/channels/:channelId/join')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async joinChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) joinChannelDto: JoinChannelDto,
    ) {
        return (await this.channelService.joinChannel(channelId, username, joinChannelDto));
    }

    @Patch('users/:username/channels/:channelId/leave')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async leaveChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) leaveChannelDto: LeaveChannelDto,
    ) {
        return (await this.channelService.leaveChannel(channelId, username, leaveChannelDto));
    }

    @Patch('users/:username/channels/:channelId/manage_access')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...) ?
    async manageChannelAccess(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) channelAccessDto: ChannelAccessDto,
    ) {
        return (await this.channelService.manageChannelAccess(channelId, username, channelAccessDto));
    }

    @Delete('users/:username/channels/:channelId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...) ?
    async deleteChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
    ) {
        return (await this.channelService.deleteChannel(channelId, username));
    }

}
