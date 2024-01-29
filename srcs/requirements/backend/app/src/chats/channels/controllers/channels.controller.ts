import { Body, Controller, Get, Param, ParseIntPipe, Post, ValidationPipe } from '@nestjs/common';
import { ChannelsService } from '../services/channels/channels.service';
import { CreateChannelDto } from '../dtos/CreateChannel.dto';
import { CreateGamelogDto } from 'src/gamelogs/dtos/CreateGamelog.dto';

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

    /*
    @Get()
    async getRelationships(@Param('userId', ParseIntPipe) userId: number) {
        return (await this.relationshipService.getUserRelationships(userId));
    }

    @Get(':targetId')
    async getRelationship(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('targetId', ParseIntPipe) targetId: number
    ) {
        return (await this.relationshipService.getUserRelationship(userId, targetId));
    }

    @Post()
    async createRelationship(
        @Param('userId', ParseIntPipe) userId: number,
        @Body(new ValidationPipe) createRelationshipDto: CreateRelationshipDto,
    ) {
        return (this.relationshipService.createUserRelationship(userId, createRelationshipDto));
    }

    @Put(':targetId')
    async replaceRelationship(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('targetId', ParseIntPipe) targetId: number,
        @Body(new ValidationPipe) replaceRelationshipDto: ReplaceRelationshipDto,
    ) {
        return (this.relationshipService.replaceUserRelationship(userId, targetId, replaceRelationshipDto));
    }

    @Patch(':targetId')
    async updateRelationship(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('targetId', ParseIntPipe) targetId: number,
        @Body(new ValidationPipe) updateRelationshipDto: UpdateRelationshipDto,
    ) {
        return (this.relationshipService.updateUserRelationship(userId, targetId, updateRelationshipDto));
    }

    @Delete(':targetId')
    async deleteUserById(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('targetId', ParseIntPipe) targetId: number,
    ) {
        return (await this.relationshipService.deleteRelationship(userId, targetId));
    }
    */

}
