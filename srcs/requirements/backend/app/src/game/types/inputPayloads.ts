export type Ball = {
	x: number,
	y: number,
	speedX: number,
	speedY: number
}

export type Player = {
	x: number,
	y: number,
	speed: number
}

export type InputPayloads = {
	ball: Ball,
	player1: Player,
	player2: Player
}