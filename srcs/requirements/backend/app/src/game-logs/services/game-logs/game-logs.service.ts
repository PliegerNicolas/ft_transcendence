import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameLog } from 'src/game-logs/entities/GameLog';
import { Repository } from 'typeorm';

@Injectable()
export class GameLogsService {

    constructor(
        @InjectRepository(GameLog)
        private readonly gameLogRepository: Repository<GameLog>,
    ) {}

    async getGameLogs() {
        return (await this.gameLogRepository.find());
    }

}
