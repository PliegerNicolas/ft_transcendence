import { useEffect, useState, useRef } from "react";

import "../styles/play.css";

const WINDOW_WIDTH = 900;
const WINDOW_HEIGHT = 600;

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 20;
const PADDLE_SPEED = 12;

const BALL_SIZE = 10;

const MAX_SCORE = 5;

// <Play /> ====================================================================

function Play()
{
	return (
		<main className="MainContent">
			<Game/>
		</main>
	);
}

const Game = () => {
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
  
	useEffect(() => {
		const gameCanvas = canvasRef.current;
		const gameContext = gameCanvas?.getContext('2d');
		gameContext!.font = "40px Orbitron";
	
		if (gameContext) {
			const drawBoardDetails = () => {
				for (var i = 0; i < WINDOW_HEIGHT; i += 30) {
					gameContext!.fillStyle = "#fff";
					gameContext!.fillRect((WINDOW_WIDTH / 2) - 3, i + 10, 6, 15);
				}
			
				gameContext!.fillText(score.player1.toString(), (WINDOW_WIDTH / 2) - 50, 40);
				gameContext!.fillText(score.player2.toString(), (WINDOW_WIDTH / 2) + 30, 40);
			}

			const drawGameOver = () => {
				gameContext!.font = "80px Orbitron";
				gameContext!.fillStyle = "#fff";
				if (score.player1 >= MAX_SCORE) {
					gameContext!.fillText("Player 1 won", (WINDOW_WIDTH / 2) - 200, (WINDOW_HEIGHT / 2));
				}
				else if (score.player2 >= MAX_SCORE) {
					gameContext!.fillText("Player 2 won", (WINDOW_WIDTH / 2) - 200, (WINDOW_HEIGHT / 2));
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
				if (player1.y - PADDLE_SPEED > PADDLE_SPEED)
					setPlayer1((prev) => ({ ...prev, speed: -PADDLE_SPEED }));
				event.preventDefault();
				break;
			case 's':
				if (player1.y + PADDLE_SPEED < (WINDOW_HEIGHT - PADDLE_HEIGHT))
					setPlayer1((prev) => ({ ...prev, speed: PADDLE_SPEED }));
				event.preventDefault();
				break;
			case 'ArrowUp':
				if (player2.y - PADDLE_SPEED > PADDLE_SPEED)
					setPlayer2((prev) => ({ ...prev, speed: -PADDLE_SPEED }));
				event.preventDefault();
				break;
			case 'ArrowDown':
				if (player2.y + PADDLE_SPEED < (WINDOW_HEIGHT - PADDLE_HEIGHT))
					setPlayer2((prev) => ({ ...prev, speed: PADDLE_SPEED }));
				event.preventDefault();
				break;
			default:
				break;
		}
	}

	const keyUpHandler = (event: KeyboardEvent) => {
		switch (event.key) {
			case 'w':
					setPlayer1((prev) => ({ ...prev, speed: 0 }));
					event.preventDefault();
				break;
			case 's':
					setPlayer1((prev) => ({ ...prev, speed: 0 }));
					event.preventDefault();
				break;
			case 'ArrowUp':
					setPlayer2((prev) => ({ ...prev, speed: 0 }));
					event.preventDefault();
				break;
			case 'ArrowDown':
					setPlayer2((prev) => ({ ...prev, speed: 0 }));
					event.preventDefault();
				break;
			default:
				break;
		}
	}
  
	const pauseGame = () => {
		setGameState(false);
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
		setGameOver(false);
	}

	const resetGame = () => {
		setGameState(false);
		setBall(initialBallState);
		setPlayer1(initialPlayer1State);
		setPlayer2(initialPlayer2State);
		setScore({ player1: 0, player2: 0 });
		setGameOver(false);	
	}

	return (
		<div>
	  		<canvas
				ref={canvasRef}
				width={WINDOW_WIDTH} // Set your canvas width
				height={WINDOW_HEIGHT} // Set your canvas height
				className="Canvas"></canvas>
	  		<div>
				<div className="controls">
        		<button onClick={startGame}>Start</button>
        		<button onClick={pauseGame}>Pause</button>
				<button onClick={resetGame}>Reset</button>
      		</div>
		  </div>
		</div>
	);
};

export default Play;