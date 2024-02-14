import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ParseIdPipe } from "src/common/pipes/parseid/parseid.pipe";
import { CreateGamelogDto } from "src/gamelogs/dtos/CreateGamelog.dto";
import { ReplaceGamelogDto } from "src/gamelogs/dtos/ReplaceGamelog.dto";
import { UpdateGamelogDto } from "src/gamelogs/dtos/UpdateGamelog.dto";
import { GamelogsService } from "src/gamelogs/services/gamelogs/gamelogs.service";

@Controller()
export class GamelogsController {

    constructor(private gamelogService: GamelogsService) {}

    @Get('gamelogs')
    async getGamelogs() {
        // public
        return (await this.gamelogService.getGamelogs());
    }

    @Get('users/:userId/gamelogs')
    async getUserGamelogs(@Param('userId', ParseIdPipe) userId: bigint) {
        // public ?
        return (await this.gamelogService.getUserGamelogs(userId));
    }

	@UseGuards(AuthGuard('jwt'))
    @Post('gamelogs')
    async createGamelog(@Body(new ValidationPipe) createGamelogDto: CreateGamelogDto) {
        // server permission only
        return (await this.gamelogService.createGamelog(createGamelogDto));
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('gamelogs/:gamelogId')
    async replaceGamelog(
        @Param('gamelogId', ParseIdPipe) gamelogId: bigint,
        @Body(new ValidationPipe) replaceGamelogDto: ReplaceGamelogDto
    ) {
        // server permission only
        return (await this.gamelogService.replaceGamelog(gamelogId, replaceGamelogDto));
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('gamelogs/:gamelogId')
    async updateGamelog(
        @Param('gamelogId', ParseIdPipe) gamelogId: bigint,
        @Body(new ValidationPipe) updateGamelogDto: UpdateGamelogDto
    ) {
        // server permission only
        return (await this.gamelogService.updateGamelog(gamelogId, updateGamelogDto));
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('gamelogs/:gamelogId')
    async deleteGamelog(@Param('gamelogId', ParseIdPipe) gamelogId: bigint) {
        // server permission only
        return (await this.gamelogService.deleteGamelog(gamelogId));
    }

}