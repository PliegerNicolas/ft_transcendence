import { Controller, Get } from '@nestjs/common';
import { GameLogsService } from 'src/game-logs/services/game-logs/game-logs.service';

@Controller('game-logs')
export class GameLogsController {

    constructor(private readonly gameLogService: GameLogsService) {}

    @Get()
    async getGameLogs() {
        return (await this.gameLogService.getGameLogs());
    }

}
