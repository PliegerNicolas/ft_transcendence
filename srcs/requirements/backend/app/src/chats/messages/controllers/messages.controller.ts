import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, ValidationPipe } from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { CreateMessageDto } from '../dtos/CreateMessage.dto';
import { ReplaceMessageDto } from '../dtos/ReplaceMessage.dto';

@Controller()
export class MessagesController {

    constructor(private messageService: MessagesService) {}

    /*
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

    @Put('users/:userId/channels/:channelId/messages/:id')
    async replaceChannelMessage(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('channelId', ParseIntPipe) channelId: number,
        @Param('id', ParseIntPipe) messageId: number,
        @Body(new ValidationPipe) replaceMessageDto: ReplaceMessageDto,
    ) {
        return (await this.messageService.replaceChannelMessage(userId, channelId, messageId, replaceMessageDto));
    }

    @Patch('users/:userId/channels/:channelId/messages/:id')
    async updateChannelMessage(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('channelId', ParseIntPipe) channelId: number,
        @Param('id', ParseIntPipe) messageId: number,
        @Body(new ValidationPipe) replaceMessageDto: ReplaceMessageDto,
    ) {
        return (await this.messageService.updateChannelMessage(userId, channelId, messageId, replaceMessageDto));
    }

    @Delete('users/:userId/channels/:channelId/messages/:id')
    async deleteChannelMessage(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('channelId', ParseIntPipe) channelId: number,
        @Param('id', ParseIntPipe) messageId: number,
    ) {
        return (await this.messageService.deleteChannelMessage(userId, channelId, messageId));
    }
    */

}
