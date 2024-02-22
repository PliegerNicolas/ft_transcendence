import { Controller, Get, Param, Query, Request, ValidationPipe } from '@nestjs/common';
import { ChannelsService } from '../services/channels/channels.service';
import { ParseIdPipe } from 'src/common/pipes/parse-id/parse-id.pipe';
import { GetChannelsQueryDto } from '../dtos/GetChannelsQuery.dto';

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
        @Query(new ValidationPipe({ transform: true, whitelist: true })) queryDto: GetChannelsQueryDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.getChannels(username, queryDto));
    }

    /*
    @Get('channels/:channelId')
    // UseGuard => Verify if user is connected but permit anyone to pass.
    async getChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.getChannel(channelId, username));
    }
    */

    /*@Get('channels/:channelId/members')
    // UseGuard => Verify if user is connected but permit anyone to pass.
    async getChannelMembers(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.getChannel(channelId, username));
    }*/

    /* */
    /* Private PATHS: need to be connected and concerned to access. */
    /* */

    /*@Post('channels')
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

    @Patch('channels/:channelId/join')
    // UseGuard => Verify if user connected and pass it's req.user
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...)
    async joinMyChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) joinChannelDto: JoinChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.joinChannel(channelId, username, joinChannelDto));
    }

    @Patch('channels/:channelId/leave')
    // UseGuard => Verify if user connected and pass it's req.user
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...)
    async leaveMyChannel(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) leaveChannelDto: LeaveChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.leaveChannel(channelId, username, leaveChannelDto));
    }*/

    /* */
    /* Global PATHS: need to be connected and concerned to access or be admin. It doesn't retrieve user from authentication but from the path itself. */
    /* */

    /*@Get('users/:username/channels')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async getUserChannels(
        @Param('username', ParseUsernamePipe) username: string,
        @Query('visibility') filterByVisibility?: ChannelVisibility,
    ) {
        return (await this.channelService.getChannels(username, filterByVisibility));
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
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...)
    async replaceChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) replaceChannelDto: ReplaceChannelDto,
    ) {
        return (await this.channelService.replaceChannel(channelId, username, replaceChannelDto));
    }

    @Patch('users/:username/channels/:channelId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...)
    async updateChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) updateChannelDto: UpdateChannelDto,
    ) {
        return (await this.channelService.updateChannel(channelId, username, updateChannelDto));
    }

    @Delete('users/:username/channels/:channelId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...)
    async deleteChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
    ) {
        return (await this.channelService.deleteChannel(channelId, username));
    }

    @Patch('users/:username/channels/:channelId/join')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...)
    async joinChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) joinChannelDto: JoinChannelDto,
    ) {
        return (await this.channelService.joinChannel(channelId, username, joinChannelDto));
    }

    @Patch('users/:username/channels/:channelId/leave')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...)
    async leaveChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) leaveChannelDto: LeaveChannelDto,
    ) {
        return (await this.channelService.leaveChannel(channelId, username, leaveChannelDto));
    }*/

}
