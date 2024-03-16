import { Players, gameState } from '../types/inputPayloads'
import { Server } from 'socket.io'
import { v4 as uuid } from 'uuid';
import { WINDOW_WIDTH, WINDOW_HEIGHT, BALL_SIZE, MAX_SCORE, FRAME_RATE, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_SPEED, PADDLE_SPEED } from './game.constants'
import { GameService } from '../services/game.service';
import { GamelogsService } from 'src/modules/gamelogs/services/gamelogs/gamelogs.service';
import { Injectable } from '@nestjs/common';
import { User } from 'src/modules/users/entities/User.entity';
import { ProfilesService } from 'src/modules/profiles/services/profiles/profiles.service';
import { UsersService } from 'src/modules/users/services/users/users.service';
import { IntegerType } from 'typeorm';

@Injectable()
export class GameServer {
	constructor(private readonly gameService: GameService,
				private readonly profileService: ProfilesService,
				private readonly userService: UsersService) {};

	createGameState() {
		return ({
			ball: {
				x: (WINDOW_WIDTH - BALL_SIZE) / 2 + Math.random() * 50 - 50 / 2,
				y: (WINDOW_HEIGHT - BALL_SIZE) / 2 + Math.random() * 50 - 50 / 2,
				speedX: Math.random() > 0.5 ? 5 : -5,
				speedY: Math.random() > 0.5 ? 2 : -2,
				maxSpeedY: 5},
			player1: { x: 20, y: (WINDOW_HEIGHT / 2) - PADDLE_HEIGHT, speed: 0 },
			player2: { x: WINDOW_WIDTH - PADDLE_WIDTH - 20, y: (WINDOW_HEIGHT / 2) - PADDLE_HEIGHT, speed: 0 },
			player1ID: null,
			player2ID: null,
			score: { player1: 0, player2: 0},
		})
	}

	resetGameState(gameState: gameState) {
		gameState.ball = {
				x: (WINDOW_WIDTH - BALL_SIZE) / 2 + Math.random() * 50 - 50 / 2,
				y: (WINDOW_HEIGHT - BALL_SIZE) / 2 + Math.random() * 50 - 50 / 2,
				speedX: Math.random() > 0.5 ? 5 : -5,
				speedY: Math.random() > 0.5 ? 2 : -2,
				maxSpeedY: 5};
		gameState.player1 = { x: 20, y: (WINDOW_HEIGHT / 2) - PADDLE_HEIGHT, speed: 0 };
		gameState.player2 = { x: WINDOW_WIDTH - PADDLE_WIDTH - 20, y: (WINDOW_HEIGHT / 2) - PADDLE_HEIGHT, speed: 0 };
	}

	startGameInterval(lobby: string, gameState: gameState, socket: Server, player1Username: string, player2Username: string) {
		let gameOver = false;
		const intervalId = setInterval(async () => {
			const winner = this.gameLoop(gameState);

			if (winner === 1) {
				gameState.score.player1 += 1;
				this.resetGameState(gameState);
			}
			if (winner === 2) {
				gameState.score.player2 += 1;
				this.resetGameState(gameState);
			}
			socket.to(lobby).emit('updateGame', gameState);
			if (gameOver === false && gameState.score.player1 === MAX_SCORE) {
				gameOver = true;
				this.gameService.createGamelogs(player1Username, player2Username, 1);
				socket.to(lobby).emit('gameOver', gameState);
				this.eloCalculator(await this.userService.getUser(player1Username), await this.userService.getUser(player2Username), 1);
				//console.log('player1 ELO : ' + (await this.userService.getUser(player1Username)).profile.elo + ' | player2 ELO : ' + (await this.userService.getUser(player2Username)).profile.elo);
				setTimeout(() => {clearInterval(intervalId)}, 100);
			}
			else if (gameOver === false && gameState.score.player2 === MAX_SCORE) {
				gameOver = true;
				this.gameService.createGamelogs(player1Username, player2Username, 2);
				socket.to(lobby).emit('gameOver', gameState);
				this.eloCalculator(await this.userService.getUser(player1Username), await this.userService.getUser(player2Username), 2);
				//console.log('player1 ELO : ' + (await this.userService.getUser(player1Username)).profile.elo + ' | player2 ELO : ' + (await this.userService.getUser(player2Username)).profile.elo);
				setTimeout(() => {clearInterval(intervalId)}, 100);
			}
		}, 1000 / FRAME_RATE);
	}

	gameLoop(gameState: gameState) {
		if (!gameState)
			return ;

		const player1 = gameState.player1;
		const player2 = gameState.player2;
		const ball = gameState.ball;

		ball.x += ball.speedX;
		ball.y += ball.speedY;
		const newY = player1.y + player1.speed;
		if (newY > 0 && newY < (WINDOW_HEIGHT - PADDLE_HEIGHT))
			player1.y += player1.speed;
		const newY2 = player2.y + player2.speed;
		if (newY2 > 0 && newY2 < (WINDOW_HEIGHT - PADDLE_HEIGHT))
			player2.y += player2.speed;

		//Ball collision with paddles
		if (
			ball.x - BALL_SIZE <= player1.x + PADDLE_WIDTH &&
			ball.y + BALL_SIZE >= player1.y &&
			ball.y - BALL_SIZE <= player1.y + PADDLE_HEIGHT
		) {
			ball.speedX = Math.abs(ball.speedX) + BALL_SPEED;
			const coef = (ball.y - (player1.y + (PADDLE_HEIGHT / 2))) / (PADDLE_HEIGHT * 0.5);
			ball.speedY = ball.maxSpeedY * coef;
			ball.maxSpeedY += 0.4;
		}
		if (
			ball.x + BALL_SIZE >= player2.x &&
			ball.y + BALL_SIZE >= player2.y &&
			ball.y - BALL_SIZE <= player2.y + PADDLE_HEIGHT
		) {
			ball.speedX = -(Math.abs(ball.speedX) + BALL_SPEED);
			const coef = (ball.y - (player2.y + (PADDLE_HEIGHT / 2))) / (PADDLE_HEIGHT * 0.5);
			ball.speedY = ball.maxSpeedY * coef;
			ball.maxSpeedY += 0.4;
		}

		//Ball collision with walls
		if (ball.y + BALL_SIZE >= WINDOW_HEIGHT) {
			ball.speedY = -(Math.abs(ball.speedY));
		}
		if (ball.y <= 0) {
			ball.speedY = Math.abs(ball.speedY);
		}

		//Check if someone scored
		if (ball.x + BALL_SIZE >= WINDOW_WIDTH) {
			return (1);
		}
		if (ball.x <= 0) {
			return (2);
		}

		return (0);
	}

	eloCalculator(player1: User, player2: User, gameOutcome: number) {
		const player1ExpectedOutcome = 1 / (1 + Math.pow(10, (player2.profile.elo - player1.profile.elo) / 400));
		const player2ExpectedOutcome = 1 / (1 + Math.pow(10, (player1.profile.elo - player2.profile.elo) / 400));
		var player1Elo: IntegerType;
		var player2Elo: IntegerType;
		if (gameOutcome === 1) {
			player1Elo = Math.trunc(player1.profile.elo + 32 * (1 - player1ExpectedOutcome));
			player2Elo = Math.trunc(player2.profile.elo + 32 * (0 - player2ExpectedOutcome));
			this.profileService.updateProfile(player1.username, { elo: player1Elo });
			this.profileService.updateProfile(player2.username, { elo: player2Elo });
			//console.log('player1 elo : ' + player1Elo + ' | player2 elo : ' + player2Elo);
		}
		else if (gameOutcome === 2) {
			player1Elo = Math.trunc(player1.profile.elo + 32 * (0 - player1ExpectedOutcome));
			player2Elo = Math.trunc(player2.profile.elo + 32 * (1 - player2ExpectedOutcome));
			this.profileService.updateProfile(player1.username, { elo: player1Elo });
			this.profileService.updateProfile(player2.username, { elo: player2Elo });
			//console.log('player1 elo : ' + player1Elo + ' | player2 elo : ' + player2Elo);
		}
	}

	matchmakingSystem(playersInQueue: string[], index: number, socket: Server) {
		for (var i = 0; playersInQueue[i]; i++) {
			if (index === i)
				i++;
			if (!playersInQueue[i + 1]) {
				break ;
			}
			const lobby_id = uuid();
			socket.to(playersInQueue[index]).emit('gameFound', 1, lobby_id, playersInQueue[i]);
			socket.to(playersInQueue[i]).emit('gameFound', 2, lobby_id, playersInQueue[index]);
			playersInQueue.splice(index, 1);
			playersInQueue.splice(i, 1);
		}
	}
}