import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards, ValidationPipe } from "@nestjs/common";
import { RelationshipsService } from "../../services/relationships/relationships.service";
import { ParseUsernamePipe } from "../../../../common/pipes/parse-username/parse-username.pipe";
import { CreateRelationshipDto } from "../../dtos/CreateRelationship.dto";
import { ReplaceRelationshipDto } from "../../dtos/ReplaceRelationship.dto";
import { UpdateRelationshipDto } from "../../dtos/UpdateRelationship.dto";
import { AuthGuard } from "@nestjs/passport";
import { GlobalRole } from "../../../../guards/role.decorator";
import { UsersGuard } from "../../../../guards/users.guard";
import { RoleGlobalGuard } from "../../../../guards/role.guard";
import { Serialize } from "src/common/serialization/decorators/serialize/serialize.decorator";

@Controller()
@Serialize()
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

	@UseGuards(AuthGuard('jwtTwoFactor'))
    @Get('relationships')
    // UseGuard => Verify if user connected and pass it's req.user
    async getMyRelationships(
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.relationshipService.getRelationships(username));
    }

	@UseGuards(AuthGuard('jwtTwoFactor'))
    @Get('relationships/:targetUsername')
    // UseGuard => Verify if user connected and pass it's req.user
    async getMyRelationship(
        @Request() req: any,
        @Param('targetUsername', ParseUsernamePipe) targetUsername: string,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.relationshipService.getRelationship(username, targetUsername));
    }

	@UseGuards(AuthGuard('jwtTwoFactor'))
    @Post('relationships')
    // UseGuard => Verify if user connected and pass it's req.user
    async createMyRelationship(
        @Request() req: any,
        @Body(new ValidationPipe) createRelationshipDto: CreateRelationshipDto,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.relationshipService.createRelationship(username, createRelationshipDto));
    }

	@UseGuards(AuthGuard('jwtTwoFactor'))
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

	@UseGuards(AuthGuard('jwtTwoFactor'))
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

	@UseGuards(AuthGuard('jwtTwoFactor'))
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

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Get('users/:username/relationships')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async getUserRelationships(
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        return (await this.relationshipService.getRelationships(username));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Get('users/:username/relationships/:targetUsername')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async getUserRelationship(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('targetUsername', ParseUsernamePipe) targetUsername: string,
    ) {
        return (await this.relationshipService.getRelationship(username, targetUsername));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Post('users/:username/relationships')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async createUserRelationship(
        @Param('username', ParseUsernamePipe) username: string,
        @Body(new ValidationPipe) createRelationshipDto: CreateRelationshipDto,
    ) {
        return (await this.relationshipService.createRelationship(username, createRelationshipDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Put('users/:username/relationships/:targetUsername')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async replaceUserRelationship(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('targetUsername', ParseUsernamePipe) targetUsername: string,
        @Body(new ValidationPipe) replaceRelationshipDto: ReplaceRelationshipDto,
    ) {
        return (await this.relationshipService.replaceRelationship(username, targetUsername, replaceRelationshipDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Patch('users/:username/relationships/:targetUsername')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async updateUserRelationship(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('targetUsername', ParseUsernamePipe) targetUsername: string,
        @Body(new ValidationPipe) updateRelationshipDto: UpdateRelationshipDto,
    ) {
        return (await this.relationshipService.updateRelationship(username, targetUsername, updateRelationshipDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwtTwoFactor'), UsersGuard || RoleGlobalGuard)
    @Delete('users/:username/relationships/:targetUsername')
    // UseGuard => Verify if user connected or if user as special global server permissions (OPERATOR, USER ...)
    async deleteUserRelationship(
        @Param('username', ParseUsernamePipe) username: string,
        @Param('targetUsername', ParseUsernamePipe) targetUsername: string,
    ) {
        return (await this.relationshipService.deleteRelationship(username, targetUsername));
    }

}
