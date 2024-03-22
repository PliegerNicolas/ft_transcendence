import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Request, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { ChannelsService } from "../services/channels/channels.service";
import { GetChannelDto } from "../dtos/GetChannel.dto";
import { CreateChannelDto } from "../dtos/CreateChannel.dto";
import { ReplaceChannelDto } from "../dtos/ReplaceChannel.dto";
import { UpdateChannelDto } from "../dtos/UpdateChannel.dto";
import { JoinChannelDto } from "../dtos/JoinChannel.dto";
import { LeaveChannelDto } from "../dtos/LeaveChannel.dto";
import { ChannelAccessDto } from "../dtos/ChannelAccess.dto";
import { ParseUsernamePipe } from "../../../../common/pipes/parse-username/parse-username.pipe";
import { GetChannelsQueryDto } from "../dtos/GetChannelsQuery.dto";
import { JwtPublicGuard } from "../../../../guards/jwt-public.guard";
import { AuthGuard } from "@nestjs/passport";
import { GlobalRole, Role } from "../../../../guards/role.decorator";
import { ChannelsGuard, ChannelsNotGuard } from "../../../../guards/channels.guard";
import { RoleGlobalGuard, RoleGuard } from "../../../../guards/role.guard";
import { UsersGuard } from "../../../../guards/users.guard";
import { Serialize } from "src/common/serialization/decorators/serialize/serialize.decorator";
import { IdPipe } from "src/common/pipes/id/id.pipe";
import { CreatePrivateChannelDto } from "../dtos/CreatePrivateChannel.dto";
import { MuteInterceptor } from "src/common/interceptors/mute/mute.interceptor";

@Controller()
@Serialize()
export class ChannelsController {

    constructor(private channelService: ChannelsService) {}

    /* */
    /* Public PATHS: anyone can access. */
    /* */
    
    /* */
    /* Public filtered PATHS: anyone can access but connected users would see additional data. */
    /* */

	@UseGuards(JwtPublicGuard)
    @Get('channels')
    // UseGuard => Verify if user is connected but permit anyone to pass.
    async getMyChannels(
        @Query(new ValidationPipe({ transform: true, whitelist: true })) queryDto: GetChannelsQueryDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.getChannels(username, queryDto));
    }

	@UseGuards(JwtPublicGuard)
    @UseInterceptors(MuteInterceptor)
    @Get('channels/:channelId')
    // UseGuard => Verify if user is connected but permit anyone to pass.
    async getMyChannel(
        @Param('channelId', IdPipe) channelId: bigint,
        @Body(new ValidationPipe) getChannelDto: GetChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.getChannel(channelId, username, getChannelDto));
    }

    /* */
    /* Private PATHS: need to be connected and concerned to access. */
    /* */

	@UseGuards(AuthGuard('jwtTwoFactor'))
    @Post('channels')
    // UseGuard => Verify if user connected and pass it's req.user
    async createMyChannel(
        @Body(new ValidationPipe) createChannelDto: CreateChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.createChannel(username, createChannelDto));
    }

	@UseGuards(AuthGuard('jwtTwoFactor'))
    @Post('channels/mp')
    // UseGuard => Verify if user connected and pass it's req.user
    async createMyPrivateChannel(
        @Body(new ValidationPipe) createPrivateChannelDto: CreatePrivateChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.createPrivateChannel(username, createPrivateChannelDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), ChannelsGuard || RoleGlobalGuard)
    @Put('channels/:channelId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async replaceMyChannel(
        @Param('channelId', IdPipe) channelId: bigint,
        @Body(new ValidationPipe) replaceChannelDto: ReplaceChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.replaceChannel(channelId, username, replaceChannelDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), ChannelsGuard || RoleGlobalGuard)
    @Patch('channels/:channelId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async updateMyChannel(
        @Param('channelId', IdPipe) channelId: bigint,
        @Body(new ValidationPipe) updateChannelDto: UpdateChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.updateChannel(channelId, username, updateChannelDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), ChannelsNotGuard || RoleGlobalGuard)
    @UseInterceptors(MuteInterceptor)
    @Patch('channels/:channelId/join')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async joinMyChannel(
        @Param('channelId', IdPipe) channelId: bigint,
        @Body(new ValidationPipe) joinChannelDto: JoinChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.joinChannel(channelId, username, joinChannelDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), ChannelsGuard || RoleGlobalGuard)
    @UseInterceptors(MuteInterceptor)
    @Patch('channels/:channelId/leave')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async leaveMyChannel(
        @Param('channelId', IdPipe) channelId: bigint,
        @Body(new ValidationPipe) leaveChannelDto: LeaveChannelDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.leaveChannel(channelId, username, leaveChannelDto));
    }


	@GlobalRole(['operator'])
	@Role(['owner', 'operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), ChannelsGuard || RoleGlobalGuard || RoleGuard)
    @Patch('channels/:channelId/manage_access')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...) ?
    async manageMyChannelAccess(
        @Param('channelId', IdPipe) channelId: bigint,
        @Body(new ValidationPipe) channelAccessDto: ChannelAccessDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.manageChannelAccess(channelId, username, channelAccessDto));
    }

	@GlobalRole(['operator'])
	@Role(['owner', 'operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), ChannelsGuard || RoleGlobalGuard || RoleGuard)
    @Delete('channels/:channelId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...) ?
    async deleteMyChannel(
        @Param('channelId', IdPipe) channelId: bigint,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.channelService.deleteChannel(channelId, username));
    }

    /* */
    /* Global PATHS: need to be connected and concerned to access or be admin. It doesn't retrieve user from authentication but from the path itself. */
    /* */

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Get('users/:username/channels')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async getChannels(
        @Param('username', ParseUsernamePipe) username: string,
        @Query(new ValidationPipe({ transform: true, whitelist: true })) queryDto: GetChannelsQueryDto,
    ) {
        return (await this.channelService.getChannels(username, queryDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @UseInterceptors(MuteInterceptor)
    @Get('users/:username/channels/:channelId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async getChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', IdPipe) channelId: bigint,
        @Body(new ValidationPipe) getChannelDto: GetChannelDto,
    ) {
        return (await this.channelService.getChannel(channelId, username, getChannelDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Post('users/:username/channels')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async createChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) createChannelDto: CreateChannelDto,
    ) {
        return (await this.channelService.createChannel(username, createChannelDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Post('users/:username/channels/mp')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async createPrivateChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) createPrivateChannelDto: CreatePrivateChannelDto,
    ) {
        return (await this.channelService.createPrivateChannel(username, createPrivateChannelDto));
    }

	@GlobalRole(['operator'])
	@Role(['owner', 'operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), RoleGlobalGuard || RoleGuard)
    @Put('users/:username/channels/:channelId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...) ?
    async replaceChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', IdPipe) channelId: bigint,
        @Body(new ValidationPipe) replaceChannelDto: ReplaceChannelDto,
    ) {
        return (await this.channelService.replaceChannel(channelId, username, replaceChannelDto));
    }

	@GlobalRole(['operator'])
	@Role(['owner', 'operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'),RoleGlobalGuard || RoleGuard)
    @Patch('users/:username/channels/:channelId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...) ?
    async updateChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', IdPipe) channelId: bigint,
        @Body(new ValidationPipe) updateChannelDto: UpdateChannelDto,
    ) {
        return (await this.channelService.updateChannel(channelId, username, updateChannelDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @UseInterceptors(MuteInterceptor)
    @Patch('users/:username/channels/:channelId/join')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async joinChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', IdPipe) channelId: bigint,
        @Body(new ValidationPipe) joinChannelDto: JoinChannelDto,
    ) {
        return (await this.channelService.joinChannel(channelId, username, joinChannelDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @UseInterceptors(MuteInterceptor)
    @Patch('users/:username/channels/:channelId/leave')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async leaveChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', IdPipe) channelId: bigint,
        @Body(new ValidationPipe) leaveChannelDto: LeaveChannelDto,
    ) {
        return (await this.channelService.leaveChannel(channelId, username, leaveChannelDto));
    }

	@GlobalRole(['operator'])
	@Role(['owner', 'operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), RoleGlobalGuard || RoleGuard)
    @Patch('users/:username/channels/:channelId/manage_access')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...) ?
    async manageChannelAccess(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', IdPipe) channelId: bigint,
        @Body(new ValidationPipe) channelAccessDto: ChannelAccessDto,
    ) {
        return (await this.channelService.manageChannelAccess(channelId, username, channelAccessDto));
    }

	@GlobalRole(['operator'])
	@Role(['owner'])
	@UseGuards(AuthGuard('jwtTwoFactor'), RoleGlobalGuard || RoleGuard)
    @Delete('users/:username/channels/:channelId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    // Validate role in Channel if user hasn't got special global server permissions (OPERATOR, USER ...) ?
    async deleteChannel(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', IdPipe) channelId: bigint,
    ) {
        return (await this.channelService.deleteChannel(channelId, username));
    }

}
