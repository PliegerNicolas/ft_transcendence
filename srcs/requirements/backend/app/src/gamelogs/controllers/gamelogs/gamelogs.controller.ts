<<<<<<< HEAD
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, ValidationPipe } from '@nestjs/common';
import { ParseIdPipe } from 'src/common/pipes/parseid/parseid.pipe';
=======
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards, ValidationPipe } from '@nestjs/common';
>>>>>>> main
import { CreateGamelogDto } from 'src/gamelogs/dtos/CreateGamelog.dto';
import { ReplaceGamelogDto } from 'src/gamelogs/dtos/ReplaceGamelog.dto';
import { UpdateGamelogDto } from 'src/gamelogs/dtos/UpdateGamelog.dto';
import { GamelogsService } from 'src/gamelogs/services/gamelogs/gamelogs.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from '@nestjs/passport';

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

<<<<<<< HEAD
    @Put('gamelogs/:gamelogId')
=======
	@UseGuards(AuthGuard('jwt'))
    @Put('gamelogs/:id')
>>>>>>> main
    async replaceGamelog(
        @Param('gamelogId', ParseIdPipe) gamelogId: bigint,
        @Body(new ValidationPipe) replaceGamelogDto: ReplaceGamelogDto
    ) {
        // server permission only
        return (await this.gamelogService.replaceGamelog(gamelogId, replaceGamelogDto));
    }

<<<<<<< HEAD
    @Patch('gamelogs/:gamelogId')
=======
	@UseGuards(AuthGuard('jwt'))
    @Patch('gamelogs/:id')
>>>>>>> main
    async updateGamelog(
        @Param('gamelogId', ParseIdPipe) gamelogId: bigint,
        @Body(new ValidationPipe) updateGamelogDto: UpdateGamelogDto
    ) {
        // server permission only
        return (await this.gamelogService.updateGamelog(gamelogId, updateGamelogDto));
    }

<<<<<<< HEAD
    @Delete('gamelogs/:gamelogId')
    async deleteGamelog(@Param('gamelogId', ParseIdPipe) gamelogId: bigint) {
        // server permission only
        return (await this.gamelogService.deleteGamelog(gamelogId));
=======
	@UseGuards(AuthGuard('jwt'))
    @Delete('gamelogs/:id')
    async deleteGamelog(@Param('id', ParseIntPipe) id: number) {
        return (await this.gamelogService.deleteGamelog(id));
>>>>>>> main
    }

}