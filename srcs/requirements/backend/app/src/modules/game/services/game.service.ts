import { Injectable } from '@nestjs/common';
import { GamelogsService } from 'src/modules/gamelogs/services/gamelogs/gamelogs.service';
import { GameType, GameResult } from '../types/inputPayloads'

@Injectable()
export class GameService {
	constructor(private readonly gamelogsService: GamelogsService) {};

	createGamelogs(player1Username: string, player2Username: string, winner: number) {
		if (winner === 1) {
			this.gamelogsService.createGamelog({
				userResults: [
					{ username: player1Username , result: GameResult.VICTORY },
					{ username: player2Username, result: GameResult.DEFEAT }
				],
				gameType: GameType.PONG
			});
		}
		else if (winner === 2) {
			this.gamelogsService.createGamelog({
				userResults: [
					{ username: player1Username , result: GameResult.DEFEAT },
					{ username: player2Username, result: GameResult.VICTORY }
				],
				gameType: GameType.PONG
			});
		}
	}
}
