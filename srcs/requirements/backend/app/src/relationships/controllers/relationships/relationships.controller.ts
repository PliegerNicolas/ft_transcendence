import { Body, Controller, Delete, Get, Param, Patch, Post, Put, ValidationPipe } from '@nestjs/common';
import { ParseUsernamePipe } from 'src/common/pipes/parse-username/parse-username.pipe';
import { CreateRelationshipDto } from 'src/relationships/dtos/CreateRelationship.dto';
import { ReplaceRelationshipDto } from 'src/relationships/dtos/ReplaceRelationship.dto';
import { UpdateRelationshipDto } from 'src/relationships/dtos/UpdateRelationship.dto';
import { RelationshipsService } from 'src/relationships/services/relationships/relationships.service';

@Controller('users/:username/relationships')
export class RelationshipsController {

    constructor(private relationshipService: RelationshipsService) {}

    @Get()
    async getRelationships(@Param('username', ParseUsernamePipe) username: string) {
        return (await this.relationshipService.getUserRelationships(username));
    }

    @Get(':targetUsername')
    async getRelationship(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('targetUsername') targetUsername: string
    ) {
        return (await this.relationshipService.getUserRelationship(username, targetUsername));
    }

    @Post()
    async createRelationship(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) createRelationshipDto: CreateRelationshipDto,
    ) {
        return (this.relationshipService.createUserRelationship(username, createRelationshipDto));
    }

    @Put(':targetUsername')
    async replaceRelationship(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('targetUsername') targetUsername: string,
        @Body(new ValidationPipe) replaceRelationshipDto: ReplaceRelationshipDto,
    ) {
        return (this.relationshipService.replaceUserRelationship(username, targetUsername, replaceRelationshipDto));
    }

    @Patch(':targetUsername')
    async updateRelationship(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('targetUsername') targetUsername: string,
        @Body(new ValidationPipe) updateRelationshipDto: UpdateRelationshipDto,
    ) {
        return (this.relationshipService.updateUserRelationship(username, targetUsername, updateRelationshipDto));
    }

    @Delete(':targetUsername')
    async deleteUserById(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('targetUsername') targetUsername: string,
    ) {
        return (await this.relationshipService.deleteRelationship(username, targetUsername));
    }

}
