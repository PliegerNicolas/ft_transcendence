import { useEffect, useRef } from "react";
import { socket } from "../../App.tsx"

import "../../styles/play.css";

const WINDOW_WIDTH = 1280;
const WINDOW_HEIGHT = 720;

const PADDLE_HEIGHT = 120;
const PADDLE_WIDTH = 20;

const BALL_SIZE = 15;

const MAX_SCORE = 5;

type Ball = {
	x: number,
	y: number,
	speedX: number,
	speedY: number,
	maxSpeedY: number
}

type Player = {
	x: number,
	y: number,
	speed: number
}

type InputPayloads = {
	ball: Ball,
	player1: Player,
	player2: Player,
	player1ID: string,
	player2ID: string,
	score: Score
}

type Score = {
	player1: number,
	player2: number
}

const OnlineGame = (props: any) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const destroySocketListeners = () => {
		socket.off('startedGame');
		socket.off('updateGame');
		socket.off('gameOver');
	}

	useEffect(() => {

		// Draw Functions ==============================================================================================================	

		const gameCanvas = canvasRef.current;
		const gameContext = gameCanvas?.getContext('2d');

		const drawGame = (new_gameState: InputPayloads) => {

			const drawBackground = () => {
				if (props.backgroundColor === props.paddlesColor || props.backgroundColor === props.ballColor) {
					gameContext!.fillStyle = "#000";
				}
				else {
					gameContext!.fillStyle = props.backgroundColor;
				}
				gameContext!.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
			}

			const drawLines = () => {
				for (var i = 0; i < WINDOW_HEIGHT; i += 30) {
					gameContext!.fillStyle = "#fff";
					gameContext!.fillRect((WINDOW_WIDTH / 2) - 6, i + 10, 6, 15);
				}
			}

			const drawPlayersName = () => {
				gameContext!.font = "30px Orbitron";
				gameContext!.textAlign = "center";
				gameContext!.fillStyle = "#fff";
				if (props.playerNumber === 1) {
					gameContext!.fillText("You", (WINDOW_WIDTH / 4), 40);
					gameContext!.fillText(props.oppName, (WINDOW_WIDTH / 1.333), 40);
				}
				else if (props.playerNumber === 2) {
					gameContext!.fillText(props.oppName, (WINDOW_WIDTH / 4), 40);
					gameContext!.fillText("You", (WINDOW_WIDTH / 1.333), 40);
				}
			}

			const drawScores = () => {
				gameContext!.font = "60px Orbitron";
				gameContext!.textAlign = "center";
				gameContext!.fillStyle = "#fff";
				gameContext!.fillText(new_gameState.score.player1.toString(), (WINDOW_WIDTH / 2) - 50, 60);
				gameContext!.fillText(new_gameState.score.player2.toString(), (WINDOW_WIDTH / 2) + 50, 60);
			}

			const drawBoardDetails = () => {
				drawBackground();
				drawLines();
				drawPlayersName();
				drawScores();
			}

			const drawGameOver = () => {
				drawBackground();
				gameContext!.font = "80px Orbitron";
				gameContext!.textAlign = "center";
				gameContext!.fillStyle = "#fff";
				if ((new_gameState.score.player1 >= MAX_SCORE && props.playerNumber === 1) || (new_gameState.score.player2 >= MAX_SCORE && props.playerNumber === 2)) {
					gameContext!.fillText("You won", (WINDOW_WIDTH / 2), (WINDOW_HEIGHT / 2));
				}
				else {
					gameContext!.fillText("You lost", (WINDOW_WIDTH / 2), (WINDOW_HEIGHT / 2));
				}
			}

			const drawGameState = () => {
				gameContext!.fillStyle = props.paddlesColor;
				gameContext!.fillRect(new_gameState.player1.x, new_gameState.player1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
				gameContext!.fillRect(new_gameState.player2.x, new_gameState.player2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
				gameContext!.fillStyle = props.ballColor;
				gameContext!.fillRect(new_gameState.ball.x, new_gameState.ball.y, BALL_SIZE, BALL_SIZE);
			}

			drawBoardDetails();
			drawGameState();
			if (props.gameOver) {
				drawGameOver();
			}
		}

		const drawTimer = () => {
			gameContext!.fillStyle = "#000";
			gameContext!.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
			gameContext!.fillStyle = "#fff";
			gameContext!.textAlign = "center";
			gameContext!.font = "150px Orbitron";
			gameContext!.fillText("3", WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2);
			setTimeout(() => {
				gameContext!.fillStyle = "#000";
				gameContext!.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
				gameContext!.fillStyle = "#fff";
				gameContext!.textAlign = "center";
				gameContext!.font = "150px Orbitron";
				gameContext!.fillText("2", WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2);
				setTimeout(() => {
					gameContext!.fillStyle = "#000";
					gameContext!.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
					gameContext!.fillStyle = "#fff";
					gameContext!.textAlign = "center";
					gameContext!.font = "150px Orbitron";
					gameContext!.fillText("1", WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2);
				}, 1000);
			}, 1000);
		}

		// Socket Listeners ==============================================================================================================

		if (socket) {
			socket.on('startedGame', () => {
				drawTimer();
				//console.log('Start game');
				props.onDataChange(false);
			});
			socket.on('updateGame', (new_gameState: InputPayloads) => {
				if (gameContext && !props.gameOver)
					requestAnimationFrame(() => drawGame(new_gameState));
			});
			socket.on('gameOver', (new_gameState: InputPayloads) => {
				//console.log('game is over');
				props.onDataChange(true);
				if (gameContext)
					requestAnimationFrame(() => drawGame(new_gameState));
				socket.emit('gameEnded', props.lobby);
				props.oppId = '';
			});
			socket.on('drawEndGame', (new_gameState: InputPayloads) => {
				if (gameContext)
					requestAnimationFrame(() => drawGame(new_gameState));
			});
		}

		window.addEventListener('keydown', keyDownHandler);
		window.addEventListener('keyup', keyUpHandler);

		return () => {
			window.removeEventListener('keydown', keyDownHandler);
			window.removeEventListener('keyup', keyUpHandler);
			if (socket)
				destroySocketListeners();
		};
	}, [[]]);

	// Handlers ==============================================================================================================

	const keyDownHandler = (event: KeyboardEvent) => {
		if (event.key === 'w' || event.key === 's' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			const key = event.key;
			socket.emit('keyDown', { key: key, lobby: props.lobby });
			event.preventDefault();
		}
	}

	const keyUpHandler = (event: KeyboardEvent) => {
		if (event.key === 'w' || event.key === 's' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			const key = event.key;
			socket.emit('keyUp', { key: key, lobby: props.lobby });
			event.preventDefault();
		}
	}

	// Return ==============================================================================================================

	return (
		<div>
			<canvas
				ref={canvasRef}
				width={WINDOW_WIDTH}
				height={WINDOW_HEIGHT}
				className="Play__Canvas">
			</canvas>
		</div>
	);
};

export default OnlineGame;