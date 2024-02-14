import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, ValidationPipe } from '@nestjs/common';
import { ParseIdPipe } from 'src/common/pipes/parseid/parseid.pipe';
import { CreateRelationshipDto } from 'src/relationships/dtos/CreateRelationship.dto';
import { ReplaceRelationshipDto } from 'src/relationships/dtos/ReplaceRelationship.dto';
import { UpdateRelationshipDto } from 'src/relationships/dtos/UpdateRelationship.dto';
import { RelationshipsService } from 'src/relationships/services/relationships/relationships.service';

@Controller('users/:userId/relationships')
export class RelationshipsController {

    constructor(private relationshipService: RelationshipsService) {}

    @Get()
    async getRelationships(@Param('userId', ParseIntPipe) userId: bigint) {
        return (await this.relationshipService.getUserRelationships(userId));
    }

    @Get(':targetId')
    async getRelationship(
        @Param('userId', ParseIdPipe) userId: bigint,
        @Param('targetId', ParseIdPipe) targetId: bigint
    ) {
        return (await this.relationshipService.getUserRelationship(userId, targetId));
    }

    @Post()
    async createRelationship(
        @Param('userId', ParseIdPipe) userId: bigint,
        @Body(new ValidationPipe) createRelationshipDto: CreateRelationshipDto,
    ) {
        return (this.relationshipService.createUserRelationship(userId, createRelationshipDto));
    }

    @Put(':targetId')
    async replaceRelationship(
        @Param('userId', ParseIdPipe) userId: bigint,
        @Param('targetId', ParseIdPipe) targetId: bigint,
        @Body(new ValidationPipe) replaceRelationshipDto: ReplaceRelationshipDto,
    ) {
        return (this.relationshipService.replaceUserRelationship(userId, targetId, replaceRelationshipDto));
    }

    @Patch(':targetId')
    async updateRelationship(
        @Param('userId', ParseIdPipe) userId: bigint,
        @Param('targetId', ParseIdPipe) targetId: bigint,
        @Body(new ValidationPipe) updateRelationshipDto: UpdateRelationshipDto,
    ) {
        return (this.relationshipService.updateUserRelationship(userId, targetId, updateRelationshipDto));
    }

    @Delete(':targetId')
    async deleteUserById(
        @Param('userId', ParseIdPipe) userId: bigint,
        @Param('targetId', ParseIdPipe) targetId: bigint,
    ) {
        return (await this.relationshipService.deleteRelationship(userId, targetId));
    }

}
