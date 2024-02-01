import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, ValidationPipe } from '@nestjs/common';
import { ChannelsService } from '../services/channels/channels.service';
import { CreateChannelDto } from '../dtos/CreateChannel.dto';
import { UpdateChannelDto } from '../dtos/UpdateChannel.dto';
import { ReplaceChannelDto } from '../dtos/ReplaceChannel.dto';

@Controller()
export class ChannelsController {

    constructor(private channelService: ChannelsService) {}

    @Get('channels')
    async getChannels() {
        return (await this.channelService.getChannels());
    }

    @Get('users/:userId/channels')
    async getUserChannels(@Param('userId', ParseIntPipe) userId: number) {
        return (await this.channelService.getUserChannels(userId));
    }

    @Post('users/:userId/channels')
    async createChannel(
        @Param('userId', ParseIntPipe) userId: number,
        @Body(new ValidationPipe) createChannelDto: CreateChannelDto
    ) {
        return (await this.channelService.createChannel(userId, createChannelDto));
    }

    @Put('channels/:id')
    async replaceChannel(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ValidationPipe) replaceChannelDto: ReplaceChannelDto
    ) {
        return (await this.channelService.replaceChannel(id, replaceChannelDto));
    }

    @Patch('channels/:id')
    async updateChannel(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ValidationPipe) updateChannelDto: UpdateChannelDto
    ) {
        return (await this.channelService.updateChannel(id, updateChannelDto));
    }

    @Patch('users/:userId/channels/:id/join')
    async joinChannel(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('id', ParseIntPipe) channelId: number,
    ) {
        return (await this.channelService.joinChannel(userId, channelId));
    }

    @Patch('users/:userId/channels/:id/leave')
    async leaveChannel(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('id', ParseIntPipe) channelId: number,
    ) {
        return (await this.channelService.leaveChannel(userId, channelId));
    }

    @Delete('channels/:id')
    async deleteChannel(@Param('id', ParseIntPipe) id: number) {
        return (await this.channelService.deleteChannel(id));
    }

}
