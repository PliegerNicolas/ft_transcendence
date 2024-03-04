import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards, ValidationPipe } from "@nestjs/common";
import { GamelogsService } from "../../services/gamelogs/gamelogs.service";
import { ParseIdPipe } from "../../../../common/pipes/parse-id/parse-id.pipe";
import { ParseUsernamePipe } from "../../../../common/pipes/parse-username/parse-username.pipe";
import { CreateGamelogDto } from "../../dtos/CreateGamelog.dto";
import { ReplaceGamelogDto } from "../../dtos/ReplaceGamelog.dto";
import { UpdateGamelogDto } from "../../dtos/UpdateGamelog.dto";
import { AuthGuard } from "@nestjs/passport";
import { GlobalRole } from "../../../../guards/role.decorator";
import { RoleGlobalGuard } from "../../../../guards/role.guard";

@Controller()
export class GamelogsController {

    constructor(private gamelogService: GamelogsService) {}

    /* */
    /* Public PATHS: anyone can access. */
    /* */

    @Get('all_gamelogs')
    async getAllGamelogs() {
        return (await this.gamelogService.getAllGamelogs());
    }

    @Get('gamelogs/:gamelogId')
    async getGamelog(
        @Param('gamelogId', ParseIdPipe) gamelogId: bigint,
    ) {
        return (await this.gamelogService.getGamelog(gamelogId));
    }

    @Get('users/:username/gamelogs')
    async getUserGamelogs(
        @Param('username', ParseUsernamePipe) username: string,
    ) {
        return (await this.gamelogService.getUserGamelogs(username));
    }

    /* */
    /* Public filtered PATHS: anyone can access but connected users would see additional data. */
    /* */

    /* */
    /* Private PATHS: need to be connected and concerned to access. */
    /* */

	@UseGuards(AuthGuard('jwt'))
    @Get('gamelogs')
    // UseGuard => Verify if user connected and pass it's req.user
    async getMyGamelogs(
        @Request() req: any,
    ) {
        const username = req.user ? req.user.username : undefined;
        return (await this.gamelogService.getUserGamelogs(username));
    }
    
    /* */
    /* Global PATHS: need to be connected and concerned to access or be admin. It doesn't retrieve user from authentication but from the path itself. */
    /* */

    // /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\
    // /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\
    // /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\
    // In our cases here we have to enforce being ADMIN or MODERATOR to access to update gamelogs.
    // /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\
    // /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\
    // /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), RoleGlobalGuard)
    @Post('gamelogs')
    // UseGuard => Verify if user connected AND if user as special global server permissions (ADMIN, OPERATOR ...)
    async createGamelog(
        @Body(new ValidationPipe) createGamelogDto: CreateGamelogDto,
    ) {
        return (await this.gamelogService.createGamelog(createGamelogDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), RoleGlobalGuard)
    @Put('gamelogs/:gamelogId')
    // UseGuard => Verify if user connected AND if user as special global server permissions (ADMIN, OPERATOR ...)
    async replaceGamelog(
        @Body(new ValidationPipe) replaceGamelogDto: ReplaceGamelogDto,
        @Param('gamelogId', ParseIdPipe) gamelogId: bigint,
    ) {
        return (await this.gamelogService.replaceGamelog(gamelogId, replaceGamelogDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), RoleGlobalGuard)
    @Patch('gamelogs/:gamelogId')
    // UseGuard => Verify if user connected AND if user as special global server permissions (ADMIN, OPERATOR ...)
    async updateGamelog(
        @Body(new ValidationPipe) updateGamelogDto: UpdateGamelogDto,
        @Param('gamelogId', ParseIdPipe) gamelogId: bigint,
    ) {
        return (await this.gamelogService.updateGamelog(gamelogId, updateGamelogDto));
    }

	@GlobalRole(['operator'])
	@UseGuards(AuthGuard('jwt'), RoleGlobalGuard)
    @Delete('gamelogs/:gamelogId')
    // UseGuard => Verify if user connected AND if user as special global server permissions (ADMIN, OPERATOR ...)
    async deleteGamelog(
        @Param('gamelogId', ParseIdPipe) gamelogId: bigint,
    ) {
        return (await this.gamelogService.deleteGamelog(gamelogId));
    }

}