import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards, ValidationPipe } from "@nestjs/common";
import { MessagesService } from "../services/messages.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateMessageDto } from "../dtos/CreateMessage.dto";
import { ParseIdPipe } from "src/common/pipes/parse-id/parse-id.pipe";
import { ReplaceMessageDto } from "../dtos/ReplaceMessage.dto";
import { UpdateMessageDto } from "../dtos/UpdateMessage.dto";
import { ParseUsernamePipe } from "src/common/pipes/parse-username/parse-username.pipe";

@Controller()
export class MessagesController {

    constructor(private messageService: MessagesService) {}

    /* */
    /* Public PATHS: anyone can access. */
    /* */

    /* */
    /* Public filtered PATHS: anyone can access but connected users would see additional data. */
    /* */

    @Get('channels/:channelId/messages')
    // UseGuard => Verify if user connected and pass it's req.user
    async getMyChannelMessages(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (null);
    }

    @Get('channels/:channelId/message')
    // UseGuard => Verify if user connected and pass it's req.user
    async getMyChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (null);
    }

    /* */
    /* Private PATHS: need to be connected and concerned to access. */
    /* */

    @Post('channels/:channelId/messages')
    // UseGuard => Verify if user connected and pass it's req.user
    async createMyChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) createMessageDto: CreateMessageDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (null);
    }

    @Put('channels/:channelId/messages')
    // UseGuard => Verify if user connected and pass it's req.user
    async replaceMyChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) replaceMessageDto: ReplaceMessageDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (null);
    }

    @Patch('channels/:channelId/messages')
    // UseGuard => Verify if user connected and pass it's req.user
    async updateMyChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) updateMessageDto: UpdateMessageDto,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (null);
    }

    @Delete('channels/:channelId/messages')
    // UseGuard => Verify if user connected and pass it's req.user
    async deleteMyChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (null);
    }

    /* */
    /* Global PATHS: need to be connected and concerned to access or be admin. It doesn't retrieve user from authentication but from the path itself. */
    /* */

    @Get('users/:username/channels/:channelId/messages')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async getChannelMessages(
        @Param('username', ParseUsernamePipe) username: bigint,
        @Param('channelId', ParseIdPipe) channelId: bigint,
    ) {
        return (null);
    }

    @Get('users/:username/channels/:channelId/message')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async getChannelMessage(
        @Param('username', ParseUsernamePipe) username: bigint,
        @Param('channelId', ParseIdPipe) channelId: bigint,
    ) {
        return (null);
    }

    @Post('users/:username/channels/:channelId/messages')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async createChannelMessage(
        @Param('username', ParseUsernamePipe) username: bigint,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) createMessageDto: CreateMessageDto,
    ) {
        return (null);
    }

    @Put('users/:username/channels/:channelId/messages')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async replaceChannelMessage(
        @Param('username', ParseUsernamePipe) username: bigint,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) replaceMessageDto: ReplaceMessageDto,
    ) {
        return (null);
    }

    @Patch('users/:username/channels/:channelId/messages')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async updateChannelMessage(
        @Param('username', ParseUsernamePipe) username: bigint,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) updateMessageDto: UpdateMessageDto,
    ) {
        return (null);
    }

    @Delete('users/:username/channels/:channelId/messages')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async deleteChannelMessage(
        @Param('username', ParseUsernamePipe) username: bigint,
        @Param('channelId', ParseIdPipe) channelId: bigint,
    ) {
        return (null);
    }






    /*
    @Get('channels/:channelId/messages')
    async getChannelMessages(
        @Param('channelId', ParseIdPipe) channelId: bigint,
    ) {
        // Should pass userId (if user is connected and passport validated or null)
        // For this moment userId is passed as 1.
        return (await this.messageService.getChannelMessages(BigInt(1), channelId));
    }

    @Get('channels/:channelId/messages/:messageId')
    async getChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('messageId', ParseIdPipe) messageId: bigint
    ) {
        // Should pass userId (if user is connected and passport validated or null)
        // For this moment userId is passed as 1.
        return (await this.messageService.getChannelMessage(BigInt(1), channelId, messageId));
    }

    //@UseGuards(AuthGuard('jwt'))
    @Post('channels/:channelId/messages')
    async createChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) createMessageDto: CreateMessageDto,
    ) {
        // Should pass userId (if user is connected and passport validated or null)
        // For this moment userId is passed as 1.
        return (await this.messageService.createChannelMessage(BigInt(1), channelId, createMessageDto));
    }

	//@UseGuards(AuthGuard('jwt'))
    @Put('channels/:channelId/messages/:messageId')
    async replaceChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('messageId', ParseIdPipe) messageId: bigint,
        @Body(new ValidationPipe) replaceMessageDto: ReplaceMessageDto,
    ) {
        // Should pass userId (if user is connected and passport validated or null)
        // For this moment userId is passed as 1.
        return (await this.messageService.replaceChannelMessage(BigInt(1), channelId, messageId, replaceMessageDto));
    }

	//@UseGuards(AuthGuard('jwt'))
    @Patch('channels/:channelId/messages/:messageId')
    async updateChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('messageId', ParseIdPipe) messageId: bigint,
        @Body(new ValidationPipe) updateMessageDto: UpdateMessageDto,
    ) {
        // Should pass userId (if user is connected and passport validated or null)
        // For this moment userId is passed as 1.
        return (await this.messageService.updateChannelMessage(BigInt(1), channelId, messageId, updateMessageDto));
    }

	//@UseGuards(AuthGuard('jwt'))
    @Delete('channels/:channelId/messages/:messageId')
    async deleteChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('messageId', ParseIdPipe) messageId: bigint,
    ) {
        // Should pass userId (if user is connected and passport validated or null)
        // For this moment userId is passed as 1.
        return (await this.messageService.deleteChannelMessage(BigInt(1), channelId, messageId));
    }
    */

}
