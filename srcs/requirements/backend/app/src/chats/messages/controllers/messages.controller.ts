import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards, ValidationPipe } from "@nestjs/common";
import { MessagesService } from "../services/messages.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateMessageDto } from "../dtos/CreateMessage.dto";
import { ParseIdPipe } from "src/common/pipes/parse-id/parse-id.pipe";
import { ReplaceMessageDto } from "../dtos/ReplaceMessage.dto";
import { UpdateMessageDto } from "../dtos/UpdateMessage.dto";
import { ParseUsernamePipe } from "src/common/pipes/parse-username/parse-username.pipe";
import { RoleGlobalGuard } from "src/role/role.guard";

@Controller()
export class MessagesController {

    constructor(private messageService: MessagesService) {}

    /* */
    /* Public PATHS: anyone can access. */
    /* */

    /* */
    /* Public filtered PATHS: anyone can access but connected users would see additional data. */
    /* */

	@UseGuards(AuthGuard('jwt'))
    @Get('channels/:channelId/messages')
    // UseGuard => Verify if user connected and pass it's req.user
    async getMyChannelMessages(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.messageService.getChannelMessages(channelId, username));
    }

	@UseGuards(AuthGuard('jwt'))
    @Get('channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected and pass it's req.user
    async getMyChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('messageId', ParseIdPipe) messageId: bigint,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.messageService.getChannelMessage(channelId, username, messageId));
    }

    /* */
    /* Private PATHS: need to be connected and concerned to access. */
    /* */

	@UseGuards(AuthGuard('jwt'))
    @Post('channels/:channelId/messages')
    // UseGuard => Verify if user connected and pass it's req.user
    async createMyChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) createMessageDto: CreateMessageDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.messageService.createChannelMessage(channelId, username, createMessageDto));
    }

	@UseGuards(AuthGuard('jwt'))
    @Put('channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected and pass it's req.user
    async replaceMyChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('messageId', ParseIdPipe) messageId: bigint,
        @Body(new ValidationPipe) replaceMessageDto: ReplaceMessageDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.messageService.replaceChannelMessage(channelId, username, messageId, replaceMessageDto));
    }

	@UseGuards(AuthGuard('jwt'))
    @Patch('channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected and pass it's req.user
    async updateMyChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('messageId', ParseIdPipe) messageId: bigint,
        @Body(new ValidationPipe) updateMessageDto: UpdateMessageDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.messageService.updateChannelMessage(channelId, username, messageId, updateMessageDto));
    }

	@UseGuards(AuthGuard('jwt'))
    @Delete('channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected and pass it's req.user
    async deleteMyChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('messageId', ParseIdPipe) messageId: bigint,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.messageService.deleteChannelMessage(channelId, username, messageId));
    }

    /* */
    /* Global PATHS: need to be connected and concerned to access or be admin. It doesn't retrieve user from authentication but from the path itself. */
    /* */

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), RoleGlobalGuard)
    @Get('users/:username/channels/:channelId/messages')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async getChannelMessages(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
    ) {
        return (await this.messageService.getChannelMessages(channelId, username));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), RoleGlobalGuard)
    @Get('users/:username/channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async getChannelMessage(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('messageId', ParseIdPipe) messageId: bigint,
    ) {
        return (await this.messageService.getChannelMessage(channelId, username, messageId));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), RoleGlobalGuard)
    @Post('users/:username/channels/:channelId/messages')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async createChannelMessage(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) createMessageDto: CreateMessageDto,
    ) {
        return (await this.messageService.createChannelMessage(channelId, username, createMessageDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), RoleGlobalGuard)
    @Put('users/:username/channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async replaceChannelMessage(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('messageId', ParseIdPipe) messageId: bigint,
        @Body(new ValidationPipe) replaceMessageDto: ReplaceMessageDto,
    ) {
        return (await this.messageService.replaceChannelMessage(channelId, username, messageId, replaceMessageDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), RoleGlobalGuard)
    @Patch('users/:username/channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async updateChannelMessage(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('messageId', ParseIdPipe) messageId: bigint,
        @Body(new ValidationPipe) updateMessageDto: UpdateMessageDto,
    ) {
        return (await this.messageService.updateChannelMessage(channelId, username, messageId, updateMessageDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), RoleGlobalGuard)
    @Delete('users/:username/channels/:channelId/messages/:messageId')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async deleteChannelMessage(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('messageId', ParseIdPipe) messageId: bigint,
    ) {
        return (await this.messageService.deleteChannelMessage(channelId, username, messageId));
    }

}
