import { Body, Controller, Get, Param, ParseIntPipe, Post, ValidationPipe } from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { CreateMessageDto } from '../dtos/CreateMessage.dto';

@Controller()
export class MessagesController {

    constructor(private messageService: MessagesService) {}

    @Get('users/:userId/channels/:channelId/messages')
    async getChannelMessages(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('channelId', ParseIntPipe) channelId: number,
    ) {
        return (await this.messageService.getChannelMessages(userId, channelId));
    }

    @Get('users/:userId/channels/:channelId/messages/:messageId')
    async getChannelMessage(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('channelId', ParseIntPipe) channelId: number,
        @Param('messageId', ParseIntPipe) messageId: number
    ) {
        return (await this.messageService.getChannelMessage(userId, channelId, messageId));
    }

    @Post('users/:userId/channels/:channelId/messages')
    async createChannelMessage(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('channelId', ParseIntPipe) channelId: number,
        @Body(new ValidationPipe) createMessageDto: CreateMessageDto,
    ) {
        return (await this.messageService.createChannelMessage(userId, channelId, createMessageDto));
    }

}
