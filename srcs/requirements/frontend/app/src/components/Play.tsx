import { useEffect, useState } from "react";

import "../styles/play.css";

const WINDOW_WIDTH = 900;
const WINDOW_HEIGHT = 600;

const PADDLE_HEIGHT = 60;
const PADDLE_WIDTH = 20;

const BALL_SIZE = 10;

const MAX_SCORE = 5;

// <Play /> ====================================================================

function Play()
{
	return (
		<main className="MainContent">
			<Game />
		</main>
	);
}

const Game = () => {
	const gameCanvas = document.createElement('canvas');
	gameCanvas.height = 600;
	gameCanvas.width = 900;
	const gameContext = gameCanvas.getContext('2d');
	gameContext!.font = "30px Orbitron";

	const [gameState, setGameState] = useState(false);
	const [score, setScore] = useState({ player1: 0, player2: 0 });
	const [gameOver, setGameOver] = useState(false);

	const initialPlayer1State = { x: 50, y: 200 };
	const [player1, setPlayer1] = useState(initialPlayer1State);
	const initialPlayer2State = { x: 850, y: 200 };
	const [player2, setPlayer2] = useState(initialPlayer2State);

	const initialBallState = { x: 300, y: 200, speedX: 5, speedY: 5 };
	const [ball, setBall] = useState(initialBallState);

	useEffect(() => {
		if (gameState) {
			
			updateGame();
			draw();
			
			const intervalId = setInterval(updateGame, 50);

			window.addEventListener('keydown', keyDownHandler);
			window.addEventListener('keyup', keyUpHandler);

			return () => {
				clearInterval(intervalId);
				window.removeEventListener('keydown', keyDownHandler);
				window.removeEventListener('keyup', keyUpHandler);
			};
		}
	}, [gameState, ball]);

	const drawBoardDetails = () => {
		for (var i = 0; i + 30 < gameCanvas.height; i += 30) {
            gameContext!.fillStyle = "#fff";
            gameContext!.fillRect(gameCanvas.width / 2 - 10, i + 10, 15, 20);
        }
        
        gameContext!.fillText(score.player1.toString(), 280, 50);
        gameContext!.fillText(score.player2.toString(), 390, 50);
	}

	const draw = () => {
		gameContext!.fillStyle = "#000";
        gameContext!.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
              
        drawBoardDetails();

        gameContext!.fillStyle = "#fff";
        gameContext!.fillRect(player1.x, player1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
		gameContext!.fillRect(player2.x, player2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
		gameContext!.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
	}

	const updateGame = () => {
		setBall((prev) => ({ ...prev, x: prev.x + prev.speedX, y: prev.y + prev.speedY }));

		if (ball.x - BALL_SIZE <= player1.x + PADDLE_WIDTH) {
			if (ball.y + BALL_SIZE >= player1.y && ball.y - BALL_SIZE <= player1.y + PADDLE_HEIGHT) {
				setBall((prev) => ({ ...prev, speedY: -prev.speedY }));
			}
		}

		if (ball.x + BALL_SIZE <= player2.x) {
			if (ball.y + BALL_SIZE >= player2.y && ball.y - BALL_SIZE <= player2.y + PADDLE_HEIGHT) {
				setBall((prev) => ({ ...prev, speedY: -prev.speedY }));
			}
		}

		if (ball.y <= BALL_SIZE || ball.y >= (WINDOW_HEIGHT - PADDLE_HEIGHT)) {
			setBall((prev) => ({ ...prev, speedY: -prev.speedY }));
		}

		if (ball.x <= BALL_SIZE) {
			setScore({ player1: score.player1, player2: score.player2 + 1 });
			if (score.player1 >= MAX_SCORE || score.player2 >= MAX_SCORE) {
				setGameOver(true);
			}
			restartGame();
		}
		if (ball.x >= WINDOW_WIDTH) {
			setScore({ player1: score.player1 + 1, player2: score.player2 });
			if (score.player1 >= MAX_SCORE || score.player2 >= MAX_SCORE) {
				setGameOver(true);
			}
			restartGame();
		}
	};

	const keyDownHandler = (event: KeyboardEvent) => {
		switch (event.key) {
			case 'KeyW':
				if (player1.y > 0)
					setPlayer1({ x: player1.x, y: player1.y - 10});
				break;
			case 'KeyS':
				if (player1.y < (WINDOW_HEIGHT - PADDLE_HEIGHT))
					setPlayer1({ x: player1.x, y: player1.y + 10});
				break;
			case 'ArrowUp':
				if (player2.y > 20)
					setPlayer2({ x: player2.x, y: player2.y - 10});
				break;
			case 'ArrowDown':
				if (player2.y < (WINDOW_HEIGHT - PADDLE_HEIGHT))
					setPlayer1({ x: player2.x, y: player2.y + 10});
				break;
			default:
				break;
		}
		console.log(event.key);
	}

	const keyUpHandler = (event: KeyboardEvent) => {
		switch (event.key) {
			case 'KeyW':
					setPlayer1({ x: player1.x, y: player1.y });
				break;
			case 'KeyS':
					setPlayer1({ x: player1.x, y: player1.y });
				break;
			case 'ArrowUp':
					setPlayer2({ x: player2.x, y: player2.y });
				break;
			case 'ArrowDown':
					setPlayer1({ x: player2.x, y: player2.y });
				break;
			default:
				break;
		}
		console.log(event.key);
	}

	const startGame = () => {
		setGameState(true);
	}

	const restartGame = () => {
		setBall(initialBallState);
		setPlayer1(initialPlayer1State);
		setPlayer2(initialPlayer2State);
		if (gameOver) {
			setScore({ player1: 0, player2: 0 });
		}
	}

	const pauseGame = () => {
		setGameState(false);
	}

	return (
		<div>
			<div className="controls">
        		<button onClick={startGame}>Start</button>
        		<button onClick={restartGame}>Restart</button>
        		<button onClick={pauseGame}>Pause</button>
      		</div>
		  </div>
	);
}

/*
// <Game /> ====================================================================

interface GameProps {

}

const Game: React.FC<GameProps> = ({}) => {

	const canvasRef = useRef<HTMLCanvasElement>(null);

	const { player, opponent, onKeyDownHandler } = GameLogic();

	const drawGame = (ctx: CanvasRenderingContext2D) => {
		draw({ ctx, player, opponent});
	}

	return (
		<div className="Game" tabIndex={0} onKeyDown={onKeyDownHandler}>
			<Canvas ref={canvasRef} draw={drawGame}/>
		</div>
	)
}

// GameLogic ====================================================================

interface PlayerInfos {
	x: number;
	y: number;
}

interface BallInfos {
	x: number;
	y: number;
	speed: number;
	deltaX: number;
	deltaY: number;
}

const GameLogic = () => {
	const initialPaddleState = { left: 150, right: 150 };
	const [paddles, setPaddles] = useState(initialPaddleState);

	const initialBallState = { x: 300, y: 200, speedX: 5, speedY: 5 };
	const [ball, setBall] = useState(initialBallState);
	const ballRef = useRef(null)

	const [player, setPlayer] = useState<PlayerInfos>({
		x: 50,
		y: 200
	});

	const [playerAfterMovement, setPlayerAfterMovement] = useState<PlayerInfos>(player);

	const [opponent] = useState<PlayerInfos>({
		x: 850,
		y: 200
	});

	const { moveUp, moveDown } = createPlayerMovement();

	const onKeyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
		switch (event.code) {
			case 'KeyW':
				setPlayerAfterMovement(moveUp(player));
				break;
			case 'KeyS':
				setPlayerAfterMovement(moveDown(player));
				break;
		}
		console.log(event.code);
	}

	const movePlayer = () => {
		if (playerAfterMovement) {
			setPlayer(playerAfterMovement);
		}
		console.log(player.y);
	}

	useInterval(movePlayer, 50);

	return {
		player, opponent,
		onKeyDownHandler,
	};
}

// Movement ====================================================================

const createPlayerMovement = (gridSize = 5) => ({
	moveUp: (playerPos: PlayerInfos) => {
		const playerCopy = playerPos;
		playerCopy.y = playerCopy.y - gridSize;
		return playerCopy;
	},
	moveDown: (playerPos: PlayerInfos) => {
		const playerCopy = playerPos;
		playerCopy.y = playerCopy.y + gridSize;
		return playerCopy;
	},
})

// <Canvas /> ====================================================================

type CanvasProps = React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement> & {
	draw: (context: CanvasRenderingContext2D) => void;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({draw, ...props}, canvasRef) => {
	const [gameState, setGameState] = useState(false);

	useEffect(() => {
		if (gameState) {
			if (!canvasRef) {
				return ;
			}
			const canvas = (canvasRef as React.RefObject<HTMLCanvasElement>).current;
			if (!canvas) {
				return ;
			}
	
			const context = canvas.getContext('2d');
			if (!context) {
				return ;
			}
	
			draw(context);
			//return () => context.clearRect(0, 0, window.innerWidth, window.innerHeight);
		}
		
	}, [draw, canvasRef])

	if (!canvasRef) {
		return (null);
	}

	return (
		<canvas width={900} height={600} className="Canvas" ref={canvasRef} {...props} >Canvas</canvas>
	)
});

// Draw ====================================================================

interface DrawArgs {
	ctx: CanvasRenderingContext2D;
	player: PlayerInfos;
	opponent: PlayerInfos;
}

const draw = ({ ctx, player, opponent }: DrawArgs) => {
	ctx.fillStyle = 'rgb(200, 0, 0)';
	ctx.fillRect(player.x, player.y, 15, 100);
	ctx.fillRect(opponent.x, opponent.y, 15, 100);
}

// useInterval ====================================================================

function useInterval(callback: () => void, delay: number | null) {
	const savedCallback = useRef(callback);

	useLayoutEffect(() => {
		savedCallback.current = callback;
	}, [callback])

	useEffect(() => {
		if (!delay && delay !== 0) {
			return ;
		}

		const id = setInterval(() => savedCallback.current(), delay);
		return () => clearInterval(id);
	}, [delay]);
}
*/
export default Play;