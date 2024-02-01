import React, { forwardRef } from "react";
import { useEffect, useRef, useState } from "react";

import "../styles/play.css";

// <Play /> ====================================================================

function Play()
{
	return (
		<main className="MainContent">
			<h2>Play</h2>
			<Game />
		</main>
	);
}

// <Game /> ====================================================================

interface GameProps {

}

const Game: React.FC<GameProps> = ({}) => {

	const canvasRef = useRef<HTMLCanvasElement>(null);

	const draw = (ctx: CanvasRenderingContext2D) => {
		ctx.rect(0, 0, 900, 450);
	}

	return (
		<div className="Game">
			<Canvas ref={canvasRef} draw={draw}/>
		</div>
	)
}

// GameLogic ====================================================================

interface Position {
	x: number;
	y: number;
}

const GameLogic = () => {
	const [playerOne, setPlayerOne] = useState<Position>({
		x: 0,
		y: 0
	});

	const [playerTwo, setPlayerTwo] = useState<Position>({
		x: 0,
		y: 0
	});

	return {
		playerOne, playerTwo
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
		<canvas width={400} height={200} className="Canvas" ref={canvasRef} {...props} >Canvas</canvas>
	)
});

// Draw ====================================================================

interface DrawArgs {
	ctx: CanvasRenderingContext2D;
	playerOne: Position;
	playerTwo: Position;
}

const draw = ({ ctx, playerOne, playerTwo }: DrawArgs) => {
	
}

export default Play;