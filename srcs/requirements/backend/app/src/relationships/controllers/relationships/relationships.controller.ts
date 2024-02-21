import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, ValidationPipe } from '@nestjs/common';
import { ParseUsernamePipe } from 'src/common/pipes/parse-username/parse-username.pipe';
import { CreateRelationshipDto } from 'src/relationships/dtos/CreateRelationship.dto';
import { ReplaceRelationshipDto } from 'src/relationships/dtos/ReplaceRelationship.dto';
import { UpdateRelationshipDto } from 'src/relationships/dtos/UpdateRelationship.dto';
import { RelationshipsService } from 'src/relationships/services/relationships/relationships.service';

@Controller()
export class RelationshipsController {

    constructor(private relationshipService: RelationshipsService) {}

    /* */
    /* Public PATHS: anyone can access. */
    /* */

    /* */
    /* Public filtered PATHS: anyone can access but connected users would see additional data. */
    /* */

    /* */
    /* Private PATHS: need to be connected and concerned to access. */
    /* */

    @Get('relationships')
    // UseGuard => Verify if user connected and pass it's req.user
    async getMyRelationships(
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.relationshipService.getRelationships(username));
    }

    @Get('relationships/:targetUsername')
    // UseGuard => Verify if user connected and pass it's req.user
    async getMyRelationship(
        @Request() req: any,
        @Param('targetUsername', ParseUsernamePipe) targetUsername: string,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.relationshipService.getRelationship(username, targetUsername));
    }

    @Post('relationships')
    // UseGuard => Verify if user connected and pass it's req.user
    async createMyRelationship(
        @Request() req: any,
        @Body(new ValidationPipe) createRelationshipDto: CreateRelationshipDto,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.relationshipService.createRelationship(username, createRelationshipDto));
    }

    @Put('relationships/:targetUsername')
    // UseGuard => Verify if user connected and pass it's req.user
    async replaceMyRelationship(
        @Request() req: any,
        @Param('targetUsername', ParseUsernamePipe) targetUsername: string,
        @Body(new ValidationPipe) replaceRelationshipDto: ReplaceRelationshipDto,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.relationshipService.replaceRelationship(username, targetUsername, replaceRelationshipDto));
    }

    @Patch('relationships/:targetUsername')
    // UseGuard => Verify if user connected and pass it's req.user
    async updateMyRelationship(
        @Request() req: any,
        @Param('targetUsername', ParseUsernamePipe) targetUsername: string,
        @Body(new ValidationPipe) updateRelationshipDto: UpdateRelationshipDto,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.relationshipService.updateRelationship(username, targetUsername, updateRelationshipDto));
    }

    @Delete('relationships/:targetUsername')
    // UseGuard => Verify if user connected and pass it's req.user
    async deleteMyRelationship(
        @Request() req: any,
        @Param('targetUsername', ParseUsernamePipe) targetUsername: string,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.relationshipService.deleteRelationship(username, targetUsername));
    }

    /* */
    /* Global PATHS: need to be connected and concerned to access or be admin. It doesn't retrieve user from authentication but from the path itself. */
    /* */

    @Get('users/:username/relationships')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async getUserRelationships(
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        return (await this.relationshipService.getRelationships(username));
    }

    @Get('users/:username/relationships/:targetUsername')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async getUserRelationship(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('targetUsername', ParseUsernamePipe) targetUsername: string,
    ) {
        return (await this.relationshipService.getRelationship(username, targetUsername));
    }

    @Post('users/:username/relationships')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async createUserRelationship(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) createRelationshipDto: CreateRelationshipDto,
    ) {
        return (await this.relationshipService.createRelationship(username, createRelationshipDto));
    }

    @Put('users/:username/relationships/:targetUsername')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async replaceUserRelationship(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('targetUsername', ParseUsernamePipe) targetUsername: string,
        @Body(new ValidationPipe) replaceRelationshipDto: ReplaceRelationshipDto,
    ) {
        return (await this.relationshipService.replaceRelationship(username, targetUsername, replaceRelationshipDto));
    }

    @Patch('users/:username/relationships/:targetUsername')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async updateUserRelationship(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('targetUsername', ParseUsernamePipe) targetUsername: string,
        @Body(new ValidationPipe) updateRelationshipDto: UpdateRelationshipDto,
    ) {
        return (await this.relationshipService.updateRelationship(username, targetUsername, updateRelationshipDto));
    }

    @Delete('users/:username/relationships/:targetUsername')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async deleteUserRelationship(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('targetUsername', ParseUsernamePipe) targetUsername: string,
    ) {
        return (await this.relationshipService.deleteRelationship(username, targetUsername));
    }

    /* */
    /* Front-end PATHS: need to be sent via front-end and verified via a jwt key. */
    /* */

}
