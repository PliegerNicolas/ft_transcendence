import { OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { gameState } from '../types/inputPayloads'
import { createGameState, matchmakingSystem, startGameInterval } from '../server/game.server'
import { PADDLE_SPEED, WINDOW_HEIGHT,  } from '../server/game.constants'

let state: gameState[] = [];
let player1ID: string[] = [];
let player2ID: string[] = [];
let playersQueue: string[] = [];
let player1Username: string[] = [];
let player2Username: string[] = [];

@WebSocketGateway({ cors: true, namespace: 'game' })
export class GameGateway implements OnModuleInit {

	@WebSocketServer()
	server: Server;

	onModuleInit() {
		this.server.on('connection', (socket) => {
			console.log('new game socket connection : ' + socket.id);
			socket.on('disconnect', () => {
				console.log(socket.id + ' left game socket');
				this.server.emit('userLeftSocket', socket.id);
				const index = playersQueue.indexOf(socket.id, 0);
				if (index > -1) {
					playersQueue.splice(index, 1);
				}
			});
		});
	}

	@SubscribeMessage('opponentLeft')
	handleOpponentLeft(@MessageBody() data: {userId: string, lobby: string}, @ConnectedSocket() client: Socket) {
		if (player1ID[data.lobby] === data.userId) {
			if (state[data.lobby]) {
				state[data.lobby].score.player2 = 5;
			}
			const index = player1ID.indexOf(data.lobby, 0);
			if (index > -1) {
   				player1ID.splice(index, 1);
			}
		}
		else if (player2ID[data.lobby] === data.userId) {
			if (state[data.lobby]) {
				state[data.lobby].score.player1 = 5;
			}
			const index = player2ID.indexOf(data.lobby, 0);
			if (index > -1) {
   				player2ID.splice(index, 1);
			}
		}
		if (!state[data.lobby])
			this.server.to(data.lobby).emit('leaveLobby');
	}

	@SubscribeMessage('joinQueue')
	handleJoinQueue(@ConnectedSocket() client: Socket) {
		var i = 0;
		while (playersQueue[i]) {
			i++;
		}
		playersQueue[i] = client.id;
		matchmakingSystem(playersQueue, i, this.server);
	}

	@SubscribeMessage('leaveQueue')
	handleLeaveQueue(@ConnectedSocket() client: Socket) {
		var i = 0;
		while (playersQueue[i] != client.id) {
			i++;
		}
		if (playersQueue[i])
			playersQueue.splice(i, 1);
	}

	@SubscribeMessage('ready')
	handleReady(@MessageBody() data: {lobby: string, playerNumber: number, playerName: string}, @ConnectedSocket() client: Socket) {
		if (!player1ID[data.lobby] && data.playerNumber === 1) {
			player1ID[data.lobby] = client.id;
			player1Username[data.lobby] = data.playerName;
			client.join(data.lobby);
		}
		else if (!player2ID[data.lobby] && data.playerNumber === 2) {
			player2ID[data.lobby] = client.id;
			player2Username[data.lobby] = data.playerName;
			client.join(data.lobby);
		}
		if (player1ID[data.lobby] && player2ID[data.lobby]) {
			this.server.to(data.lobby).emit('gameReady');
			setTimeout(() => {this.server.to(data.lobby).emit('startedGame')}, 200);
			state[data.lobby] = createGameState();
			state[data.lobby].player1ID = player1ID[data.lobby];
			state[data.lobby].player2ID = player2ID[data.lobby];
			setTimeout(() => {startGameInterval(data.lobby, state[data.lobby], this.server, player1Username[data.lobby], player2Username[data.lobby])}, 3200);
		}
	}

	@SubscribeMessage('notReady')
	handleNotReady(@MessageBody() data: {lobby: string, playerNumber: number}, @ConnectedSocket() client: Socket) {
		if (player1ID[data.lobby] && data.playerNumber === 1) {
			const index = player1ID.indexOf(data.lobby, 0);
			if (index > -1) {
   				player1ID.splice(index, 1);
			}
			client.leave(data.lobby);
		}
		else if (player2ID[data.lobby]  && data.playerNumber === 2) {
			const index = player2ID.indexOf(data.lobby, 0);
			if (index > -1) {
   				player2ID.splice(index, 1);
			}
			client.leave(data.lobby);
		}
	}

	@SubscribeMessage('keyDown')
	handleKeyDown(@MessageBody() data: {key: string, lobby: string}, @ConnectedSocket() client: Socket) {
		if (data.key === 'w' || data.key === 'ArrowUp') {
			if (state[data.lobby].player1ID === client.id && state[data.lobby].player1.y - PADDLE_SPEED > 0) {
				state[data.lobby].player1.speed = -Math.abs(PADDLE_SPEED);
			}
			else if (state[data.lobby].player2ID === client.id && state[data.lobby].player2.y - PADDLE_SPEED > 0) {
				state[data.lobby].player2.speed = -Math.abs(PADDLE_SPEED);
			}
		}
		else if (data.key === 's' || data.key === 'ArrowDown') {
			if (state[data.lobby].player1ID === client.id && state[data.lobby].player1.y + PADDLE_SPEED < WINDOW_HEIGHT) {
				state[data.lobby].player1.speed = Math.abs(PADDLE_SPEED);
			}
			else if (state[data.lobby].player2ID === client.id && state[data.lobby].player2.y + PADDLE_SPEED < WINDOW_HEIGHT) {
				state[data.lobby].player2.speed = Math.abs(PADDLE_SPEED);
			}
		}
	}

	@SubscribeMessage('keyUp')
	handleKeyUp(@MessageBody() data: {key: string, lobby: string}, @ConnectedSocket() client: Socket) {
		if (data.key === 'w' || data.key === 'ArrowUp') {
			if (state[data.lobby].player1ID === client.id) {
				state[data.lobby].player1.speed = 0;
			}
			else if (state[data.lobby].player2ID === client.id) {
				state[data.lobby].player2.speed = 0;
			}
		}
		else if (data.key === 's' || data.key === 'ArrowDown') {
			if (state[data.lobby].player1ID === client.id) {
					state[data.lobby].player1.speed = 0;
			}
			else if (state[data.lobby].player2ID === client.id) {
				state[data.lobby].player2.speed = 0;
			}
		}
	}

	@SubscribeMessage('startGame')
	handleStartGame(@MessageBody() lobby: string) {
		this.server.to(lobby).emit('startedGame');
	}

	@SubscribeMessage('leaveLobby')
	handleLeaveLobby(@MessageBody() lobby: string, @ConnectedSocket() client: Socket) {
		client.leave(lobby);
	}

	@SubscribeMessage('sentLogs')
	handleSentLogs(@MessageBody() lobby: string) {
		this.server.to(lobby).emit('drawEndGame', state[lobby]);
	}
}