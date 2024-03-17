import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CreateMessageDto } from "../dtos/CreateMessage.dto";
import { ReplaceMessageDto } from "../dtos/ReplaceMessage.dto";
import { UpdateMessageDto } from "../dtos/UpdateMessage.dto";
import { ParseUsernamePipe } from "../../../../common/pipes/parse-username/parse-username.pipe";
import { GlobalRole } from "../../../../guards/role.decorator";
import { UsersGuard } from "../../../../guards/users.guard";
import { RoleGlobalGuard } from "../../../../guards/role.guard";
import { MessagesService } from "../services/messages/messages.service";
import { Serialize } from "src/common/serialization/decorators/serialize/serialize.decorator";
import { IdPipe } from "src/common/pipes/id/id.pipe";

@Controller()
@Serialize()
export class MessagesController {

    constructor(private messageService: MessagesService) {}

    /* */
    /* Public PATHS: anyone can access. */
    /* */

    /* */
    /* Public filtered PATHS: anyone can access but connected users would see additional data. */
    /* */

	@UseGuards(AuthGuard('jwtTwoFactor'))
    @Get('channels/:channelId/messages')
    // UseGuard => Verify if user connected and pass it's req.user
    async getMyChannelMessages(
        @Param('channelId', IdPipe) channelId: bigint,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.messageService.getChannelMessages(channelId, username));
    }

	@UseGuards(AuthGuard('jwtTwoFactor'))
    @Get('channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected and pass it's req.user
    async getMyChannelMessage(
        @Param('channelId', IdPipe) channelId: bigint,
        @Param('messageId', IdPipe) messageId: bigint,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.messageService.getChannelMessage(channelId, username, messageId));
    }

    /* */
    /* Private PATHS: need to be connected and concerned to access. */
    /* */

	@UseGuards(AuthGuard('jwtTwoFactor'))
    @Post('channels/:channelId/messages')
    // UseGuard => Verify if user connected and pass it's req.user
    async createMyChannelMessage(
        @Param('channelId', IdPipe) channelId: bigint,
        @Body(new ValidationPipe) createMessageDto: CreateMessageDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.messageService.createChannelMessage(channelId, username, createMessageDto));
    }

	@UseGuards(AuthGuard('jwtTwoFactor'))
    @Put('channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected and pass it's req.user
    async replaceMyChannelMessage(
        @Param('channelId', IdPipe) channelId: bigint,
        @Param('messageId', IdPipe) messageId: bigint,
        @Body(new ValidationPipe) replaceMessageDto: ReplaceMessageDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.messageService.replaceChannelMessage(channelId, username, messageId, replaceMessageDto));
    }

	@UseGuards(AuthGuard('jwtTwoFactor'))
    @Patch('channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected and pass it's req.user
    async updateMyChannelMessage(
        @Param('channelId', IdPipe) channelId: bigint,
        @Param('messageId', IdPipe) messageId: bigint,
        @Body(new ValidationPipe) updateMessageDto: UpdateMessageDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.messageService.updateChannelMessage(channelId, username, messageId, updateMessageDto));
    }

	@UseGuards(AuthGuard('jwtTwoFactor'))
    @Delete('channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected and pass it's req.user
    async deleteMyChannelMessage(
        @Param('channelId', IdPipe) channelId: bigint,
        @Param('messageId', IdPipe) messageId: bigint,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.messageService.deleteChannelMessage(channelId, username, messageId));
    }

    /* */
    /* Global PATHS: need to be connected and concerned to access or be admin. It doesn't retrieve user from authentication but from the path itself. */
    /* */

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Get('users/:username/channels/:channelId/messages')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async getChannelMessages(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', IdPipe) channelId: bigint,
    ) {
        return (await this.messageService.getChannelMessages(channelId, username));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Get('users/:username/channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async getChannelMessage(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', IdPipe) channelId: bigint,
        @Param('messageId', IdPipe) messageId: bigint,
    ) {
        return (await this.messageService.getChannelMessage(channelId, username, messageId));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Post('users/:username/channels/:channelId/messages')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async createChannelMessage(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', IdPipe) channelId: bigint,
        @Body(new ValidationPipe) createMessageDto: CreateMessageDto,
    ) {
        return (await this.messageService.createChannelMessage(channelId, username, createMessageDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Put('users/:username/channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async replaceChannelMessage(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', IdPipe) channelId: bigint,
        @Param('messageId', IdPipe) messageId: bigint,
        @Body(new ValidationPipe) replaceMessageDto: ReplaceMessageDto,
    ) {
        return (await this.messageService.replaceChannelMessage(channelId, username, messageId, replaceMessageDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Patch('users/:username/channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async updateChannelMessage(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', IdPipe) channelId: bigint,
        @Param('messageId', IdPipe) messageId: bigint,
        @Body(new ValidationPipe) updateMessageDto: UpdateMessageDto,
    ) {
        return (await this.messageService.updateChannelMessage(channelId, username, messageId, updateMessageDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Delete('users/:username/channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async deleteChannelMessage(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', IdPipe) channelId: bigint,
        @Param('messageId', IdPipe) messageId: bigint,
    ) {
        return (await this.messageService.deleteChannelMessage(channelId, username, messageId));
    }

}
