export type Ball = {
	x: number,
	y: number,
	speedX: number,
	speedY: number,
	maxSpeedY: number
}

export type Player = {
	x: number,
	y: number,
	speed: number
}

export type Score = {
	player1: number,
	player2: number
}

export type gameState = {
	ball: Ball,
	player1: Player,
	player2: Player,
	player1ID: string,
	player2ID: string,
	score: Score
}

export type Players = {
	id: string,
	elo: number
}

export enum GameType {
    PONG = "pong",
    UNDEFINED = "undefined",
}

export enum GameResult {
    VICTORY = 'victory',
    DEFEAT = 'defeat',
    TIE = 'tie',
}