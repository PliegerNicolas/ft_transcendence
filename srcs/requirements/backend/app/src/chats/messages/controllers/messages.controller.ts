import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards, ValidationPipe } from "@nestjs/common";
import { MessagesService } from "../services/messages.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateMessageDto } from "../dtos/CreateMessage.dto";
import { ParseIdPipe } from "src/common/pipes/parse-id/parse-id.pipe";
import { ReplaceMessageDto } from "../dtos/ReplaceMessage.dto";
import { UpdateMessageDto } from "../dtos/UpdateMessage.dto";

@Controller()
export class MessagesController {

    constructor(private messageService: MessagesService) {}

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
