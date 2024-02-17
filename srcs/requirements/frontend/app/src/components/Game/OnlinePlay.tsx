import { useEffect, useState, useRef } from "react";
import { io } from 'socket.io-client';

/*import { MyContext } from "../../utils/contexts.ts";
import { useInvalidate, stopOnHttp } from "../../utils/utils.ts";
import { UseQueryResult, useQuery, useMutation } from "@tanstack/react-query";*/

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

			const drawBackground = () => {
				gameContext!.fillStyle = backgroundColor;
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

		//Create socket listeners
		if (socket) {
			socket.on('userJoinedSocket', (newUserId: string) => {
				console.log('New user connected:', newUserId);
			});
			socket.on('userLeftSocket', (userId: string) => {
				console.log('User disconnected:', userId);
				if (userId === oppId) {
					socket.emit('opponentLeft', {userId, lobby});
					setOppId('');
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
				setGameOver(true);
				requestAnimationFrame(() => drawGame(new_gameState));
				setOppId('');
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
	}, [[gameReady]]);

	const keyDownHandler = (event: KeyboardEvent) => {
		if (event.key === 'w' || event.key === 's') {
			const key = event.key;
			socket.emit('keyDown', {key, lobby});
			event.preventDefault();
		}
	}

	const keyUpHandler = (event: KeyboardEvent) => {
		if (event.key === 'w' || event.key === 's') {
			const key = event.key;
			socket.emit('keyUp', {key, lobby});
			event.preventDefault();
		}
	}

	const readyCheckHandler = () => {
		socket.emit('ready', {lobby, playerNumber});
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

	//database related functions

	/*const context = useContext(MyContext);

	const invalidate = useInvalidate();

	const getGameLogs = useQuery({
		queryKey: ["userLogs"],
		queryFn: () => context.api.get("/"),
		retry: stopOnHttp,
	});
	
	const postUser = useMutation({
		mutationFn: (user: UserPostType) => context.api.post("/users", user),
		onSettled: () => invalidate(["users"]),
		onError: error => context.addNotif({content: error.message}),
	});

	const postChan = useMutation({
		mutationFn: (name: string) =>
			context.api.post("/channels", {name, status: "public"}),
		onSettled: () => invalidate(["allChans"]),
		onError: error => context.addNotif({content: error.message}),
	});*/

	return (
		<div>
			{gameReady === true ? <div>
			</div> : <div>
				<select onChange={(e) => setPaddlesColor(e.target.value)}>
					<option value="#fff">default</option>
    				<option value="#cc0000">red</option>
    				<option value="#2eb82e">green</option>
    				<option value="#008ae6">blue</option>
   				</select>
				<select onChange={(e) => setBackgroundColor(e.target.value)}>
					<option value="#000">default</option>
    				<option value="#cc0000">red</option>
    				<option value="#2eb82e">green</option>
    				<option value="#008ae6">blue</option>
   				</select>
				<select onChange={(e) => setBallColor(e.target.value)}>
					<option value="#fff">default</option>
    				<option value="#cc0000">red</option>
    				<option value="#2eb82e">green</option>
    				<option value="#008ae6">blue</option>
   				</select>
			</div>}
			{lobby.length === 0 ? <div>
				{inQueue === true ? <div>
					<button className="Leave-queue-button" onClick={leaveQueueHandler}>Leave Queue</button>
				</div> : <div>
					<button className="Join-queue-button" onClick={joinQueueHandler}>Join Queue</button>
				</div> }
			</div> : <div>
				{gameReady === true ? <div>
					<canvas
						ref={canvasRef}
						width={WINDOW_WIDTH}
						height={WINDOW_HEIGHT}
						className="Canvas">
					</canvas>
				</div> : <div>
					{playerReady === true ? <div>
						<button className="Not-ready-button" onClick={notReadyCheckHandler}>Not Ready</button>
					</div> : <div>
						<button className="Ready-button" onClick={readyCheckHandler}>Ready</button>
					</div>}
				</div> }
			</div> }

		</div>
	);
};

export default OnlineGame;