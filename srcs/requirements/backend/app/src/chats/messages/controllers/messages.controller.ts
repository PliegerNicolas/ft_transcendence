import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, ValidationPipe } from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { CreateMessageDto } from '../dtos/CreateMessage.dto';
import { ReplaceMessageDto } from '../dtos/ReplaceMessage.dto';
import { ParseBigIntPipe } from 'src/common/pipes/parsebigint/parsebigint.pipe';

@Controller()
export class MessagesController {

    constructor(private messageService: MessagesService) {}

    @Get('channels/:channelId/messages')
    async getChannelMessages(
        @Param('channelId', ParseBigIntPipe) channelId: bigint,
    ) {
        // Should pass userId (if user is connected and passport validated or null)
        // For this moment userId is passed as 1.
        return (await this.messageService.getChannelMessages(BigInt(1), channelId));
    }

    @Get('channels/:channelId/messages/:messageId')
    async getChannelMessage(
        @Param('channelId', ParseBigIntPipe) channelId: bigint,
        @Param('messageId', ParseBigIntPipe) messageId: bigint
    ) {
        // Should pass userId (if user is connected and passport validated or null)
        // For this moment userId is passed as 1.
        return (await this.messageService.getChannelMessage(BigInt(1), channelId, messageId));
    }

    @Post('channels/:channelId/messages')
    async createChannelMessage(
        @Param('channelId', ParseBigIntPipe) channelId: bigint,
        @Body(new ValidationPipe) createMessageDto: CreateMessageDto,
    ) {
        // Should pass userId (if user is connected and passport validated or null)
        // For this moment userId is passed as 1.
        return (await this.messageService.createChannelMessage(BigInt(1), channelId, createMessageDto));
    }

    /*
    @Put('users/:userId/channels/:channelId/messages/:id')
    async replaceChannelMessage(
        @Param('userId', ParseBigIntPipe) userId: bigint,
        @Param('channelId', ParseBigIntPipe) channelId: bigint,
        @Param('id', ParseBigIntPipe) messageId: bigint,
        @Body(new ValidationPipe) replaceMessageDto: ReplaceMessageDto,
    ) {
        return (await this.messageService.replaceChannelMessage(userId, channelId, messageId, replaceMessageDto));
    }

    @Patch('users/:userId/channels/:channelId/messages/:id')
    async updateChannelMessage(
        @Param('userId', ParseBigIntPipe) userId: bigint,
        @Param('channelId', ParseBigIntPipe) channelId: bigint,
        @Param('id', ParseBigIntPipe) messageId: bigint,
        @Body(new ValidationPipe) replaceMessageDto: ReplaceMessageDto,
    ) {
        return (await this.messageService.updateChannelMessage(userId, channelId, messageId, replaceMessageDto));
    }

    @Delete('users/:userId/channels/:channelId/messages/:id')
    async deleteChannelMessage(
        @Param('userId', ParseBigIntPipe) userId: bigint,
        @Param('channelId', ParseBigIntPipe) channelId: bigint,
        @Param('id', ParseBigIntPipe) messageId: bigint,
    ) {
        return (await this.messageService.deleteChannelMessage(userId, channelId, messageId));
    }
    */

}
