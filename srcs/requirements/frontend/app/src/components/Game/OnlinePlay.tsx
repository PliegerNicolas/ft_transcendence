import { useEffect, useState, useRef } from "react";
import { io } from 'socket.io-client';

import "../../styles/play.css";

const WINDOW_WIDTH = 900;
const WINDOW_HEIGHT = 600;

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 20;
const PADDLE_SPEED = 12;

const BALL_SIZE = 10;

const MAX_SCORE = 5;

type Ball = {
	x: number,
	y: number,
	speedX: number,
	speedY: number
}

type Player = {
	x: number,
	y: number,
	speed: number
}

export const socket = io(`http://${location.hostname}:3450/game`);

const OnlineGame = () => {
	const [lobby, setLobby] = useState('');
	const [player_number, setPlayerNumber] = useState(1);
	const [opponent_name, setOpponentName] = useState('');

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [gameState, setGameState] = useState(false);
	const [score, setScore] = useState({ player1: 0, player2: 0 });
	const [gameOver, setGameOver] = useState(false);

	const initialPlayer1State = { x: 20, y: 200, speed: 0 };
	const [player1, setPlayer1] = useState(initialPlayer1State);
	const initialPlayer2State = { x: 860, y: 200, speed: 0 };
	const [player2, setPlayer2] = useState(initialPlayer2State);

	const initialBallState = {
		x: (WINDOW_WIDTH - BALL_SIZE) / 2 + Math.random() * 50 - 50 / 2,
  		y: (WINDOW_HEIGHT - BALL_SIZE) / 2 + Math.random() * 50 - 50 / 2,
		speedX: Math.random() > 0.5 ? 3 : -3,
		speedY: Math.random() > 0.5 ? 3 : -3 };
	const [ball, setBall] = useState(initialBallState);
  
	//Socket listeners
	if (socket) {
		socket.on('createdLobby', (lobby_id: string) => {
			console.log('Lobby ' + lobby_id + ' created');
		});
		socket.on('userJoinedLobby', (newUserId: string) => {
			console.log('New user connected:', newUserId);
			setOpponentName(newUserId);
		});
		socket.on('userLeftLobby', (disconnectedUserId: string) => {
			console.log('User disconnected:', disconnectedUserId);
			setOpponentName('');
		});

		socket.on('joinedLobby', (lobby_id: string) => {
			console.log('Lobby ' + lobby_id + ' joined');
			setLobby(lobby_id);
		});
		socket.on('pausedGame', () => {
			console.log('Pause game');
			setGameState(false);
		});
		socket.on('startedGame', () => {
			console.log('Start game');
			setGameState(true);
		});
		socket.on('restartedGame', () => {
			setBall(initialBallState);
			setPlayer1(initialPlayer1State);
			setPlayer2(initialPlayer2State);
		});
		socket.on('updatedGame', (s_ball: Ball, s_player1: Player, s_player2: Player) => {
			setBall(s_ball);
			if (player_number === 1) {
				setPlayer2(s_player2);
			}
			else if (player_number === 2) {
				setPlayer1(s_player1);
			}
		});
	}

	useEffect(() => {
		const gameCanvas = canvasRef.current;
		const gameContext = gameCanvas?.getContext('2d');		
		
		if (gameContext) {
			// Draw functions
			const drawBoardDetails = () => {
				for (var i = 0; i < WINDOW_HEIGHT; i += 30) {
					gameContext!.fillStyle = "#fff";
					gameContext!.fillRect((WINDOW_WIDTH / 2) - 3, i + 10, 6, 15);
				}
				gameContext!.font = "60px Orbitron";
				gameContext!.fillText(score.player1.toString(), (WINDOW_WIDTH / 2) - 50, 60);
				gameContext!.fillText(score.player2.toString(), (WINDOW_WIDTH / 2) + 30, 60);
				gameContext!.font = "30px Orbitron";
				if (player_number === 1) {
					gameContext!.fillText("You", 150, 40);
					gameContext!.fillText(opponent_name, (WINDOW_WIDTH / 2) + 150, 40);
				}
				else if (player_number === 2) {
					gameContext!.fillText(opponent_name, 150, 40);
					gameContext!.fillText("You", (WINDOW_WIDTH / 2) + 150, 40);
				}
			}

			const drawGameOver = () => {
				gameContext!.font = "80px Orbitron";
				gameContext!.fillStyle = "#fff";
				if ((score.player1 >= MAX_SCORE && player_number === 1) || (score.player2 >= MAX_SCORE && player_number === 2)) {
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
	
			const draw = () => {
				gameContext!.fillStyle = "#000";
				gameContext!.fillRect(0, 0, gameCanvas!.width, gameCanvas!.height);
				  
				drawBoardDetails();
				if (gameOver) {
					drawGameOver();
				}
				else if (!gameState) {
					drawPause();
				}
				gameContext!.fillStyle = "#fff";
				gameContext!.fillRect(player1.x, player1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
				gameContext!.fillRect(player2.x, player2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
				gameContext!.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);	
			}
	
			gameContext!.fillStyle = 'black';
			gameContext!.fillRect(0, 0, gameCanvas!.width, gameCanvas!.height);
			
			const gameLoop = () => {
				if (score.player1 >= MAX_SCORE || score.player2 >= MAX_SCORE) {
					setGameOver(true);
				}
				if (gameState && !gameOver) {
				  updateGame();  
				}
				draw();
			}
			requestAnimationFrame(gameLoop);
	
			window.addEventListener('keydown', keyDownHandler);
			window.addEventListener('keyup', keyUpHandler);

			return () => {
				window.removeEventListener('keydown', keyDownHandler);
				window.removeEventListener('keyup', keyUpHandler);
			};
		}
	}, [[]]);

	const updateGame = () => {
		setBall((prev) => ({ ...prev, x: prev.x + prev.speedX, y: prev.y + prev.speedY }));
		movePlayer1();
		movePlayer2();
		socket.emit('updateGame', {ball, player1, player2});
		
		if (
			ball.x - BALL_SIZE <= player1.x + PADDLE_WIDTH &&
			ball.y + BALL_SIZE >= player1.y &&
			ball.y - BALL_SIZE <= player1.y + PADDLE_HEIGHT
		) {
			setBall((prev) => ({ ...prev, speedX: Math.abs(prev.speedX) + 0.2}));
		}
		  
		if (
			ball.x + BALL_SIZE >= player2.x &&
			ball.y + BALL_SIZE >= player2.y &&
			ball.y - BALL_SIZE <= player2.y + PADDLE_HEIGHT
		) {
			setBall((prev) => ({ ...prev, speedX: - (Math.abs(prev.speedX) + 0.2)}));
		}

		if (ball.y + BALL_SIZE >= WINDOW_HEIGHT) {
			setBall((prev) => ({ ...prev, speedY: -Math.abs(prev.speedY) }));
		}

		if (ball.y <= 0) {
			setBall((prev) => ({ ...prev, speedY: Math.abs(prev.speedY) }));
		}

		if (ball.x <= BALL_SIZE) {
			setScore({ player1: score.player1, player2: score.player2 + 1 });
			restartGame();
		}
		if (ball.x >= WINDOW_WIDTH) {
			setScore({ player1: score.player1 + 1, player2: score.player2 });
			restartGame();
		}
	};

	const movePlayer1 = () => {
		const newY = player1.y + player1.speed;
  		if (newY > 0 && newY < (WINDOW_HEIGHT - PADDLE_HEIGHT)) {
    		setPlayer1((prev) => ({ ...prev, y: newY }));
  		}
	}

	const movePlayer2 = () => {
		const newY = player2.y + player2.speed;
  		if (newY > 0 && newY < (WINDOW_HEIGHT - PADDLE_HEIGHT)) {
    		setPlayer2((prev) => ({ ...prev, y: newY }));
  		}
	}

	const keyDownHandler = (event: KeyboardEvent) => {
		switch (event.key) {
			case 'w':
				if (player_number === 1) {
					if (player1.y - PADDLE_SPEED > PADDLE_SPEED)
						setPlayer1((prev) => ({ ...prev, speed: -PADDLE_SPEED }));
				}
				else if (player_number === 2) {
					if (player2.y - PADDLE_SPEED > PADDLE_SPEED)
						setPlayer2((prev) => ({ ...prev, speed: -PADDLE_SPEED }));
				}
				event.preventDefault();
				break;
			case 's':
				if (player_number === 1) {
					if (player1.y + PADDLE_SPEED < (WINDOW_HEIGHT - PADDLE_HEIGHT))
						setPlayer1((prev) => ({ ...prev, speed: PADDLE_SPEED }));
				}
				else if (player_number === 2) {
					if (player2.y + PADDLE_SPEED < (WINDOW_HEIGHT - PADDLE_HEIGHT))
						setPlayer2((prev) => ({ ...prev, speed: PADDLE_SPEED }));
				}
				event.preventDefault();
				break;
			/*case 'ArrowUp':
				if (player2.y - PADDLE_SPEED > PADDLE_SPEED)
					setPlayer2((prev) => ({ ...prev, speed: -PADDLE_SPEED }));
				event.preventDefault();
				break;
			case 'ArrowDown':
				if (player2.y + PADDLE_SPEED < (WINDOW_HEIGHT - PADDLE_HEIGHT))
					setPlayer2((prev) => ({ ...prev, speed: PADDLE_SPEED }));
				event.preventDefault();
				break;*/
			default:
				break;
		}
	}

	const keyUpHandler = (event: KeyboardEvent) => {
		switch (event.key) {
			case 'w':
				if (player_number === 1) {
					setPlayer1((prev) => ({ ...prev, speed: 0 }));
				}
				else if (player_number === 2 ) {
					setPlayer2((prev) => ({ ...prev, speed: 0 }));
				}
				event.preventDefault();
				break;
			case 's':
				if (player_number === 1) {
					setPlayer1((prev) => ({ ...prev, speed: 0 }));
				}
				else if (player_number === 2 ) {
					setPlayer2((prev) => ({ ...prev, speed: 0 }));
				}
				event.preventDefault();
				break;
			/*case 'ArrowUp':
					setPlayer2((prev) => ({ ...prev, speed: 0 }));
					event.preventDefault();
				break;
			case 'ArrowDown':
					setPlayer2((prev) => ({ ...prev, speed: 0 }));
					event.preventDefault();
				break;*/
			default:
				break;
		}
	}
  
	const pauseGame = () => {
		setGameState(false);
		socket.emit('pauseGame');
	}

	const startGame = () => {
		setGameState(true);
		socket.emit('startGame');
	}

	const restartGame = () => {
		setBall(initialBallState);
		setPlayer1(initialPlayer1State);
		setPlayer2(initialPlayer2State);
		socket.emit('restartGame');
	}

	const lobbyCreateHandler = () => {
		socket.emit('createLobby', 'lobby1');
		setLobby('lobby1');
		setPlayerNumber(1);
	}

	const lobbyJoinHandler = () => {
		socket.emit('joinLobby', 'lobby1');
		setLobby('lobby1');
		setPlayerNumber(2);
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
	  			<div>
					<div className="controls">
        				<button onClick={startGame}>Start</button>
        				<button onClick={pauseGame}>Pause</button>
      				</div>
				</div>
			</div> }

		</div>
	);
};

export default OnlineGame;