import { Body, Controller, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { MessagesService } from "../services/messages.service";
import { ParseIdPipe } from "src/common/pipes/parseid/parseid.pipe";
import { AuthGuard } from "@nestjs/passport";
import { CreateMessageDto } from "../dtos/CreateMessage.dto";

@Controller()
export class MessagesController {

    constructor(private messageService: MessagesService) {}

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

    @UseGuards(AuthGuard('jwt'))
    @Post('channels/:channelId/messages')
    async createChannelMessage(
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Body(new ValidationPipe) createMessageDto: CreateMessageDto,
    ) {
        // Should pass userId (if user is connected and passport validated or null)
        // For this moment userId is passed as 1.
        return (await this.messageService.createChannelMessage(BigInt(1), channelId, createMessageDto));
    }

    /*
	@UseGuards(AuthGuard('jwt'))
    @Put('users/:userId/channels/:channelId/messages/:id')
    async replaceChannelMessage(
        @Param('userId', ParseIdPipe) userId: bigint,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('id', ParseIdPipe) messageId: bigint,
        @Body(new ValidationPipe) replaceMessageDto: ReplaceMessageDto,
    ) {
        return (await this.messageService.replaceChannelMessage(userId, channelId, messageId, replaceMessageDto));
    }

	@UseGuards(AuthGuard('jwt'))
    @Patch('users/:userId/channels/:channelId/messages/:id')
    async updateChannelMessage(
        @Param('userId', ParseIdPipe) userId: bigint,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('id', ParseIdPipe) messageId: bigint,
        @Body(new ValidationPipe) replaceMessageDto: ReplaceMessageDto,
    ) {
        return (await this.messageService.updateChannelMessage(userId, channelId, messageId, replaceMessageDto));
    }

	@UseGuards(AuthGuard('jwt'))
    @Delete('users/:userId/channels/:channelId/messages/:id')
    async deleteChannelMessage(
        @Param('userId', ParseIdPipe) userId: bigint,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('id', ParseIdPipe) messageId: bigint,
    ) {
        return (await this.messageService.deleteChannelMessage(userId, channelId, messageId));
    }
    */

}
