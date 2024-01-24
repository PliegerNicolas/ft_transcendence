import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, ValidationPipe } from '@nestjs/common';
import { CreateGamelogDto } from 'src/gamelogs/dtos/CreateGamelog.dto';
import { ReplaceGamelogDto } from 'src/gamelogs/dtos/ReplaceGamelog.dto';
import { UpdateGamelogDto } from 'src/gamelogs/dtos/UpdateGamelog.dto';
import { GamelogsService } from 'src/gamelogs/services/gamelogs/gamelogs.service';

@Controller()
export class GamelogsController {

    constructor(private gamelogService: GamelogsService) {}

    @Get('gamelogs')
    async getGamelogs() {
        return (await this.gamelogService.getGamelogs());
    }

    @Get('users/:userId/gamelogs')
    async getUserGamelogs(@Param('userId', ParseIntPipe) userId: number) {
        return (await this.gamelogService.getUserGamelogs(userId));
    }

    @Post('gamelogs')
    async createGamelog(@Body(new ValidationPipe) createGamelogDto: CreateGamelogDto) {
        return (await this.gamelogService.createGamelog(createGamelogDto));
    }

    @Put('gamelogs/:id')
    async replaceGamelog(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ValidationPipe) replaceGamelogDto: ReplaceGamelogDto
    ) {
        return (null);
    }

    @Patch('gamelogs/:id')
    async updateGamelog(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ValidationPipe) updateGamelogDto: UpdateGamelogDto
    ) {
        return (null);
    }

    @Delete('gamelogs/:id')
    async deleteGamelog(@Param('id', ParseIntPipe) id: number) {
        return (null);
    }

}