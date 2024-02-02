import React, { forwardRef } from "react";
import { useEffect, useRef, useState, useLayoutEffect } from "react";

import "../styles/play.css";

// <Play /> ====================================================================

function Play()
{
	return (
		<main className="MainContent">
			<Game />
		</main>
	);
}

// <Game /> ====================================================================

interface GameProps {

}

const Game: React.FC<GameProps> = ({}) => {

	const canvasRef = useRef<HTMLCanvasElement>(null);

	const { playerOne, playerTwo, onKeyDownHandler } = GameLogic();

	const drawGame = (ctx: CanvasRenderingContext2D) => {
		draw({ ctx, playerOne, playerTwo});
	}

	return (
		<div className="Game" tabIndex={0} onKeyDown={onKeyDownHandler}>
			<Canvas ref={canvasRef} draw={drawGame}/>
		</div>
	)
}

// GameLogic ====================================================================

interface Position {
	x: number;
	y: number;
}

enum Direction {
	UP,
	DOWN
}

const GameLogic = () => {
	const[direction, setDirection] = useState<Direction>();

	const [playerOne] = useState<Position>({
		x: 50,
		y: 200
	});

	const [playerTwo] = useState<Position>({
		x: 850,
		y: 200
	});

	const onKeyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
		switch (event.code) {
			case 'keyS':
				setDirection(Direction.DOWN);
				break;
			case 'keyW':
				setDirection(Direction.UP);
				break;
		}
	}

	const movePlayer = () => {

	}

	useInterval(movePlayer, 75);

	return {
		playerOne, playerTwo,
		onKeyDownHandler,
	};
}

// <Canvas /> ====================================================================

type CanvasProps = React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement> & {
	draw: (context: CanvasRenderingContext2D) => void;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({draw, ...props}, canvasRef) => {

	useEffect(() => {
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
	playerOne: Position;
	playerTwo: Position;
}

const draw = ({ ctx, playerOne, playerTwo }: DrawArgs) => {
	ctx.fillStyle = 'rgb(200, 0, 0)';
	ctx.fillRect(playerOne.x, playerOne.y, 15, 100);
	ctx.fillRect(playerTwo.x, playerTwo.y, 15, 100);
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

export default Play;