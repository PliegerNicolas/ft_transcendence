import { Body, Controller, Get, Param, Post, ValidationPipe } from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { CreateMessageDto } from '../dtos/CreateMessage.dto';
import { ParseIdPipe } from 'src/common/pipes/parseid/parseid.pipe';

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
    @Put('users/:userId/channels/:channelId/messages/:id')
    async replaceChannelMessage(
        @Param('userId', ParseIdPipe) userId: bigint,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('id', ParseIdPipe) messageId: bigint,
        @Body(new ValidationPipe) replaceMessageDto: ReplaceMessageDto,
    ) {
        return (await this.messageService.replaceChannelMessage(userId, channelId, messageId, replaceMessageDto));
    }

    @Patch('users/:userId/channels/:channelId/messages/:id')
    async updateChannelMessage(
        @Param('userId', ParseIdPipe) userId: bigint,
        @Param('channelId', ParseIdPipe) channelId: bigint,
        @Param('id', ParseIdPipe) messageId: bigint,
        @Body(new ValidationPipe) replaceMessageDto: ReplaceMessageDto,
    ) {
        return (await this.messageService.updateChannelMessage(userId, channelId, messageId, replaceMessageDto));
    }

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
