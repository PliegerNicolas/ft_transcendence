import { Ball, Player, gameState } from '../types/inputPayloads'
import { Socket, Server } from 'socket.io'
import { WINDOW_WIDTH, WINDOW_HEIGHT, BALL_SIZE, MAX_SCORE, FRAME_RATE, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_SPEED, PADDLE_SPEED } from './game.constants'

export function createGameState() {
	return ({
		ball: {
			x: (WINDOW_WIDTH - BALL_SIZE) / 2 + Math.random() * 50 - 50 / 2,
			y: (WINDOW_HEIGHT - BALL_SIZE) / 2 + Math.random() * 50 - 50 / 2,
			speedX: Math.random() > 0.5 ? 3 : -3,
			speedY: Math.random() > 0.5 ? 3 : -3 },
		player1: { x: 20, y: 200, speed: 0 },
		player2: { x: 860, y: 200, speed: 0 },
		player1ID: null,
		player2ID: null,
		score: { player1: 0, player2: 0},
	})
}

function resetGameState(gameState: gameState) {
	gameState.ball = {
			x: (WINDOW_WIDTH - BALL_SIZE) / 2 + Math.random() * 50 - 50 / 2,
			y: (WINDOW_HEIGHT - BALL_SIZE) / 2 + Math.random() * 50 - 50 / 2,
			speedX: Math.random() > 0.5 ? 3 : -3,
			speedY: Math.random() > 0.5 ? 3 : -3 };
	gameState.player1 = { x: 20, y: 200, speed: 0 };
	gameState.player2 = { x: 860, y: 200, speed: 0 };
}

export function startGameInterval(lobby: string, gameState: gameState, socket: Server) {
	const intervalId = setInterval(() => {
		const winner = gameLoop(gameState);
		
		if (winner === 1) {
			gameState.score.player1 += 1;
			resetGameState(gameState);
			console.log(gameState);
		}
		if (winner === 2) {
			gameState.score.player2 += 1;
			resetGameState(gameState);
			console.log(gameState);
		}
		//console.log(gameState);
		socket.to(lobby).emit('updateGame', gameState);
		if (gameState.score.player1 === MAX_SCORE) {
			socket.to(lobby).emit('gameOver', gameState);
			setTimeout(() => {clearInterval(intervalId)}, 50);
		}
		else if (gameState.score.player2 === MAX_SCORE) {
			socket.to(lobby).emit('gameOver', gameState);
			setTimeout(() => {clearInterval(intervalId)}, 50);
		}
	}, 1000 / FRAME_RATE);
}

function gameLoop(gameState: gameState) {
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
	}
	if (
		ball.x + BALL_SIZE >= player2.x &&
		ball.y + BALL_SIZE >= player2.y &&
		ball.y - BALL_SIZE <= player2.y + PADDLE_HEIGHT
	) {
		ball.speedX = -(Math.abs(ball.speedX) + BALL_SPEED);
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
