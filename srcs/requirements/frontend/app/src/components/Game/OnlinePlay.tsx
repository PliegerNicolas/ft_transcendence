import { useEffect, useState, useRef } from "react";
import { io } from 'socket.io-client';

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

export const socket = io(`http://${location.hostname}:3450/game`);

const OnlineGame = () => {
	const [lobby, setLobby] = useState<string>('');
	const [playerNumber, setPlayerNumber] = useState(1);
	const [oppId, setOppId] = useState('');

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [gameOver, setGameOver] = useState(false);

	const [inQueue, setInQueue] = useState(false);
	const [gameReady, setGameReady] = useState(false);
	const [playerReady, setPlayerReady] = useState(false);

	const [backgroundColor, setBackgroundColor] = useState('#000');
	const [paddlesColor, setPaddlesColor] = useState('#fff');
	const [ballColor, setBallColor] = useState('#fff');
  
	const destroySocketListeners = () => {
		socket.off('userJoinedSocket');
		socket.off('userLeftSocket');
		socket.off('leaveLobby');
		socket.off('gameFound');
		socket.off('gameReady');
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
				if (backgroundColor === paddlesColor || backgroundColor === ballColor) {
					gameContext!.fillStyle = "#000";
				}
				else {
					gameContext!.fillStyle = backgroundColor;
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
				if (playerNumber === 1) {
					gameContext!.fillText("You", (WINDOW_WIDTH / 4), 40);
					gameContext!.fillText(new_gameState.player2ID, (WINDOW_WIDTH / 1.333), 40);
				}
				else if (playerNumber === 2) {
					gameContext!.fillText(new_gameState.player1ID, (WINDOW_WIDTH / 4), 40);
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
				if ((new_gameState.score.player1 >= MAX_SCORE && playerNumber === 1) || (new_gameState.score.player2 >= MAX_SCORE && playerNumber === 2)) {
					gameContext!.fillText("You won", (WINDOW_WIDTH / 2), (WINDOW_HEIGHT / 2));
				}
				else {
					gameContext!.fillText("You lost", (WINDOW_WIDTH / 2), (WINDOW_HEIGHT / 2));
				}
			}

			const drawGameState = () => {
				gameContext!.fillStyle = paddlesColor;
				gameContext!.fillRect(new_gameState.player1.x, new_gameState.player1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
				gameContext!.fillRect(new_gameState.player2.x, new_gameState.player2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
				gameContext!.fillStyle = ballColor;
				gameContext!.fillRect(new_gameState.ball.x, new_gameState.ball.y, BALL_SIZE, BALL_SIZE);	
			}
	
			drawBoardDetails();
			drawGameState();
			if (gameOver) {
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
			socket.on('userJoinedSocket', (newUserId: string) => {
				console.log('New user connected:', newUserId);
			});
			socket.on('userLeftSocket', (userId: string) => {
				console.log('User disconnected:', userId);
				if (userId === oppId) {
					console.log('opponent left lobby');
					socket.emit('opponentLeft', {userId, lobby});
					setOppId('');
					if (gameOver === true) {
						setLobby('');
						setGameReady(false);
					}
				}
			});
			socket.on('leaveLobby', () => {
				setPlayerReady(false);
				setInQueue(false);
				setLobby('');				
			});
			socket.on('gameFound', (player_number: number, lobby_id: string, opp_id: string) => {
				console.log('lobby : ' + lobby_id + ' joined');
				setLobby(lobby_id);
				setOppId(opp_id);
				setPlayerNumber(player_number);
				setInQueue(false);
			});
			socket.on('gameReady', () => {
				setGameReady(true);
			})
			socket.on('startedGame', () => {
				drawTimer();
				console.log('Start game');
				setGameOver(false);
			});
			socket.on('updateGame', (new_gameState: InputPayloads) => {
				if (gameContext && !gameOver)
					requestAnimationFrame(() => drawGame(new_gameState));
			});
			socket.on('gameOver', (new_gameState: InputPayloads) => {
				console.log('game is over');
				setGameOver(true);
				if (gameContext)
					requestAnimationFrame(() => drawGame(new_gameState));
				socket.emit('gameEnded', lobby);
				setOppId('');
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
			socket.emit('keyDown', {key, lobby});
			event.preventDefault();
		}
	}

	const keyUpHandler = (event: KeyboardEvent) => {
		if (event.key === 'w' || event.key === 's' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			const key = event.key;
			socket.emit('keyUp', {key, lobby});
			event.preventDefault();
		}
	}

	const readyCheckHandler = () => {
		if (playerNumber === 1)
			socket.emit('ready', {lobby: lobby, playerNumber: playerNumber, playerName: 'Maëvo'});
		else if (playerNumber === 2)
			socket.emit('ready', {lobby: lobby, playerNumber: playerNumber, playerName: 'Léa'});
		setPlayerReady(true);
	}

	const notReadyCheckHandler = () => {
		socket.emit('notReady', {lobby, playerNumber});
		setPlayerReady(false);
	}

	const joinQueueHandler = () => {
		setInQueue(true);
		socket.emit('joinQueue');
	}

	const leaveQueueHandler = () => {
		setInQueue(false);
		socket.emit('leaveQueue');
	}

	const backToMenuHandler = () => {
		setInQueue(false);
		setPlayerReady(false);
		setGameReady(false);
		setGameOver(false);
		socket.emit('leaveLobby', lobby);
		setLobby('');
	}

// Return ==============================================================================================================

	return (
		<div>
			{gameReady === true ? <div>
			</div> : <section className="Play__SelectorSection">
				<h3>Customize your game</h3>
				<div className="Play__Selectors">
					<div className="Play__PaddleSelector">
						<span className="Play__CustomName">Paddle</span>
						<select id="PaddleSelect"  onChange={(e) => setPaddlesColor(e.target.value)}>
							<option value="#fff">default</option>
    						<option value="#cc0000">red</option>
    						<option value="#2eb82e">green</option>
    						<option value="#008ae6">blue</option>
   						</select>
					</div>
					<div className="Play__BackgroundSelector">
						<span>Background</span>
						<select id="BackgroundSelect" onChange={(e) => setBackgroundColor(e.target.value)}>
							<option value="#000">default</option>
    						<option value="#cc0000">red</option>
    						<option value="#2eb82e">green</option>
    						<option value="#008ae6">blue</option>
   						</select>
					</div>
					<div className="Play__BallSelector">
						<span>Ball</span>
						<select id="BallSelect" onChange={(e) => setBallColor(e.target.value)}>
							<option value="#fff">default</option>
    						<option value="#cc0000">red</option>
    						<option value="#2eb82e">green</option>
    						<option value="#008ae6">blue</option>
   						</select>
					</div>
				</div>
			</section>}
			{lobby.length === 0 ? <div>
				{inQueue === true ? <div>
					<span className="Play__InQueueText">In Queue</span>
					<div className="Play__Ellipsis">
  						<div className="Play__Dot" style={{ '--dot-index': 1 } as React.CSSProperties}></div>
  						<div className="Play__Dot" style={{ '--dot-index': 2 } as React.CSSProperties}></div>
  						<div className="Play__Dot" style={{ '--dot-index': 3 } as React.CSSProperties}></div>
					</div>
					<button className="Play__LeaveQueueButton Play__ButtonAnimation" onClick={leaveQueueHandler}>Leave Queue</button>
				</div> : <div>
					<button className="Play__JoinQueueButton Play__ButtonAnimation" onClick={joinQueueHandler}>Join Queue</button>
				</div> }
			</div> : <div>
				{gameReady === true ? <div>
					<canvas
						ref={canvasRef}
						width={WINDOW_WIDTH}
						height={WINDOW_HEIGHT}
						className="Play__Canvas">
					</canvas>
					{gameOver === true ? <div>
						<button className="Play__BackToMenu" onClick={backToMenuHandler}>Back to Menu</button>
					</div> : <div></div>}
				</div> : <div>
					<div className="Play__ReadyCheckText">
						<span>You have found an opponent !</span>
					</div>
					{playerReady === true ? <div>
						<button className="Play__NotReadyButton Play__ButtonAnimation" onClick={notReadyCheckHandler}>Not Ready</button>
					</div> : <div>
						<button className="Play__ReadyButton Play__ButtonAnimation" onClick={readyCheckHandler}>Ready</button>
					</div>}
				</div> }
			</div> }
			{gameReady === true ? <div></div> : <div>
				<span className="Play__Instructions">Use W/S or 🔼/🔽 to control your paddle</span>
			</div>}
		</div>
	);
};

export default OnlineGame;