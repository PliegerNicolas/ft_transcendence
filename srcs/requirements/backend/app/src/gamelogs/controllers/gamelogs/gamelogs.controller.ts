import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, ValidationPipe } from '@nestjs/common';
import { ParseBigIntPipe } from 'src/common/pipes/parsebigint/parsebigint.pipe';
import { CreateGamelogDto } from 'src/gamelogs/dtos/CreateGamelog.dto';
import { ReplaceGamelogDto } from 'src/gamelogs/dtos/ReplaceGamelog.dto';
import { UpdateGamelogDto } from 'src/gamelogs/dtos/UpdateGamelog.dto';
import { GamelogsService } from 'src/gamelogs/services/gamelogs/gamelogs.service';

@Controller()
export class GamelogsController {

    constructor(private gamelogService: GamelogsService) {}

    @Get('gamelogs')
    async getGamelogs() {
        // public
        return (await this.gamelogService.getGamelogs());
    }

    @Get('users/:userId/gamelogs')
    async getUserGamelogs(@Param('userId', ParseBigIntPipe) userId: bigint) {
        // public ?
        return (await this.gamelogService.getUserGamelogs(userId));
    }

    @Post('gamelogs')
    async createGamelog(@Body(new ValidationPipe) createGamelogDto: CreateGamelogDto) {
        // server permission only
        return (await this.gamelogService.createGamelog(createGamelogDto));
    }

    @Put('gamelogs/:gamelogId')
    async replaceGamelog(
        @Param('gamelogId', ParseBigIntPipe) gamelogId: bigint,
        @Body(new ValidationPipe) replaceGamelogDto: ReplaceGamelogDto
    ) {
        // server permission only
        return (await this.gamelogService.replaceGamelog(gamelogId, replaceGamelogDto));
    }

    @Patch('gamelogs/:gamelogId')
    async updateGamelog(
        @Param('gamelogId', ParseBigIntPipe) gamelogId: bigint,
        @Body(new ValidationPipe) updateGamelogDto: UpdateGamelogDto
    ) {
        // server permission only
        return (await this.gamelogService.updateGamelog(gamelogId, updateGamelogDto));
    }

    @Delete('gamelogs/:gamelogId')
    async deleteGamelog(@Param('gamelogId', ParseBigIntPipe) gamelogId: bigint) {
        // server permission only
        return (await this.gamelogService.deleteGamelog(gamelogId));
    }

}