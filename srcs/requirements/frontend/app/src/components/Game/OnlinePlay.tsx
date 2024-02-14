import { useEffect, useState, useRef } from "react";
import { io } from 'socket.io-client';

import "../../styles/play.css";

const WINDOW_WIDTH = 900;
const WINDOW_HEIGHT = 600;

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 20;

const BALL_SIZE = 10;

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

export const socket = io(`http://${location.hostname}:3450/game`);

const OnlineGame = () => {
	const [lobbyList, setLobbyList] = useState<Map<string, Set<string>>>();
	const [lobby, setLobby] = useState('');
	const [playerNumber, setPlayerNumber] = useState(1);
	const [oppId, setOppId] = useState('');

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [gameState, setGameState] = useState(false);
	const [gameOver, setGameOver] = useState(false);
  
	const destroySocketListeners = () => {
		socket.off('createdLobby');
		socket.off('userJoinedLobby');
		socket.off('userLeftLobby');
		socket.off('joinedLobby');
		socket.off('pausedGame');
		socket.off('startedGame');
		socket.off('updateGame');
		socket.off('updateScore');
		socket.off('gameOver');
	}

	useEffect(() => {
		const gameCanvas = canvasRef.current;
		const gameContext = gameCanvas?.getContext('2d');
		
		const drawGame = (new_gameState: InputPayloads) => {
			const drawBoardDetails = () => {
				for (var i = 0; i < WINDOW_HEIGHT; i += 30) {
					gameContext!.fillStyle = "#fff";
					gameContext!.fillRect((WINDOW_WIDTH / 2) - 3, i + 10, 6, 15);
				}
				gameContext!.font = "60px Orbitron";
				gameContext!.fillText(new_gameState.score.player1.toString(), (WINDOW_WIDTH / 2) - 50, 60);
				gameContext!.fillText(new_gameState.score.player2.toString(), (WINDOW_WIDTH / 2) + 30, 60);
				gameContext!.font = "30px Orbitron";
				if (playerNumber === 1) {
					gameContext!.fillText("You", 150, 40);
					gameContext!.fillText(new_gameState.player2ID, (WINDOW_WIDTH / 2) + 150, 40);
				}
				else if (playerNumber === 2) {
					gameContext!.fillText(new_gameState.player1ID, 150, 40);
					gameContext!.fillText("You", (WINDOW_WIDTH / 2) + 150, 40);
				}
			}
	
			const drawGameOver = () => {
				gameContext!.font = "80px Orbitron";
				gameContext!.fillStyle = "#fff";
				if ((new_gameState.score.player1 >= MAX_SCORE && playerNumber === 1) || (new_gameState.score.player2 >= MAX_SCORE && playerNumber === 2)) {
					gameContext!.fillText("You won", (WINDOW_WIDTH / 2) - 200, (WINDOW_HEIGHT / 2));
				}
				else {
					gameContext!.fillText("You lost", (WINDOW_WIDTH / 2) - 200, (WINDOW_HEIGHT / 2));
				}
			}
	
			const drawPause = () => {
				gameContext!.font = "60px Orbitron";
				gameContext!.fillStyle = "#fff";
				gameContext!.fillText("Game Paused", (WINDOW_WIDTH / 2) - 150, (WINDOW_HEIGHT / 2));
			}
	
			gameContext!.fillStyle = "#000";
			gameContext!.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
				  
			drawBoardDetails();
			if (gameOver) {
				drawGameOver();
			}
			else if (!gameState) {
				drawPause();
			}
			gameContext!.fillStyle = "#fff";
			gameContext!.fillRect(new_gameState.player1.x, new_gameState.player1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
			gameContext!.fillRect(new_gameState.player2.x, new_gameState.player2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
			gameContext!.fillRect(new_gameState.ball.x, new_gameState.ball.y, BALL_SIZE, BALL_SIZE);	
	
			//gameContext!.fillStyle = 'black';
			//gameContext!.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
		}

		//Create socket listeners
		if (socket) {
			socket.on('lobbyList', (lobby_list: Map<string, Set<string>>) => {
				setLobbyList(lobby_list);
				console.log(lobbyList);
			});
			socket.on('createdLobby', (lobby_id: string) => {
				console.log(lobby_id + ' created');
				setLobby(lobby_id)
			});
			socket.on('userJoinedLobby', (newUserId: string) => {
				console.log('New user connected:', newUserId);
				setOppId(newUserId);
			});
			socket.on('userLeftServer', (userId: string) => {
				console.log('User disconnected:', userId);
				if (userId === oppId) {
					socket.emit('playerDisconnect', userId);
				}
			});
	
			socket.on('joinedLobby', (lobby_id: string) => {
				console.log(lobby_id + ' joined');
				setLobby(lobby_id);
				setPlayerNumber(2);
			});
			socket.on('lobbyFull', (lobby_id: string) => {
				console.log(lobby_id + ' is full');
			});
			socket.on('startedGame', () => {
				console.log('Start game');
				setGameState(true);
			});
			socket.on('updateGame', (new_gameState: InputPayloads) => {
				if (gameContext)
					requestAnimationFrame(() => drawGame(new_gameState));
			});
			socket.on('gameOver', (new_gameState: InputPayloads) => {
				setGameOver(true);
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

	const keyDownHandler = (event: KeyboardEvent) => {
		if (event.key === 'w' || event.key === 's') {
			socket.emit('keyDown', event.key);
			event.preventDefault();
		}
	}

	const keyUpHandler = (event: KeyboardEvent) => {
		if (event.key === 'w' || event.key === 's') {
			socket.emit('keyUp', event.key);
			event.preventDefault();
		}
	}

	const lobbyCreateHandler = () => {
		socket.emit('createLobby', 'lobby1');
		setLobby('lobby1');
		setPlayerNumber(1);
	}
/*
	const lobbyListHandler = () => {
		socket.emit('getLobbyList');
	}
*/
	const lobbyJoinHandler = () => {
		socket.emit('joinLobby', 'lobby1');
	}

	const initGameHandler = () => {
		socket.emit('initGame', lobby);
	}

	return (
		<div>
			{lobby.length === 0 ? <div>
				<button onClick={lobbyCreateHandler}>Create Lobby</button>
				<button onClick={lobbyJoinHandler}>Join Lobby</button>
			</div> : <div>
				<canvas
					ref={canvasRef}
					width={WINDOW_WIDTH}
					height={WINDOW_HEIGHT}
					className="Canvas"></canvas>
					<button onClick={initGameHandler}>Start game</button>
			</div> }

		</div>
	);
};

export default OnlineGame;