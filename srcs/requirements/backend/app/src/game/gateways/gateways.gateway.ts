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

@WebSocketGateway({ cors: true, namespace: 'game' })
export class GameGateway implements OnModuleInit {

	@WebSocketServer()
	server: Server;

	onModuleInit() {
		this.server.on('connection', (socket) => {
			console.log('new game socket connection : ' + socket.id)
			socket.on('disconnect', () => {
				this.server.emit('userLeftServer', socket.id);
			});
		});
	}
  
	@SubscribeMessage('createLobby')
	handleLobbyCreate(@MessageBody() lobby: string, @ConnectedSocket() client: Socket) {
		console.log('created lobby with id : ' + lobby)
		client.join(lobby);
		this.server.to(lobby).emit('createdLobby', lobby);
		player1ID[lobby] = client.id;
	}
  
	@SubscribeMessage('joinLobby')
	handleLobbyJoin(@MessageBody() lobby: string, @ConnectedSocket() client: Socket) {
		//if (player1ID && player2ID) {
		//	client.emit('lobbyFull', lobby_name);
		//}
		//else {
			client.join(lobby);
			client.emit('joinedLobby', lobby, player1ID[lobby]);
			this.server.to(lobby).emit('userJoinedLobby', client.id);
			player2ID[lobby] = client.id;
		//}
	}

	@SubscribeMessage('leftLobby')
	handleLobbyLeft(@MessageBody() lobby: string, @ConnectedSocket() client: Socket) {
		client.leave(lobby);
		this.server.to(lobby).emit('userLeftLobby', client.id);
		if (player1ID[lobby] === client.id) {
			const index = player1ID.indexOf(lobby, 0);
			if (index > -1) {
   				player1ID.splice(index, 1);
			}
		}
		else if (player2ID[lobby] === client.id) {
			const index = player2ID.indexOf(lobby, 0);
			if (index > -1) {
   				player2ID.splice(index, 1);
			}
		}
	}

	@SubscribeMessage('playerDisconnect')
	handlePlayerDisconnect(@MessageBody() data: {userId: string, lobby: string}, @ConnectedSocket() client: Socket) {
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
			const index = player1ID.indexOf(data.lobby, 0);
			if (index > -1) {
   				player1ID.splice(index, 1);
			}
		}
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

	@SubscribeMessage('ready')
	handleReady(@MessageBody() data: {lobby: string, playerNumber: number}, @ConnectedSocket() client: Socket) {
		if (!player1ID[data.lobby] && data.playerNumber === 1) {
			console.log("player 1 ready");
			player1ID[data.lobby] = client.id;
			client.join(data.lobby);
		}
		else if (!player2ID[data.lobby]  && data.playerNumber === 2) {
			console.log("player 2 ready");
			player2ID[data.lobby] = client.id;
			client.join(data.lobby);
		}
		if (player1ID[data.lobby] && player2ID[data.lobby]) {
			this.server.to(data.lobby).emit('gameReady');
			this.server.to(data.lobby).emit('startedGame');
			state[data.lobby] = createGameState();
			state[data.lobby].player1ID = player1ID[data.lobby];
			state[data.lobby].player2ID = player2ID[data.lobby];
			setTimeout(() => {startGameInterval(data.lobby, state[data.lobby], this.server);}, 3000);
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
		if (data.key === 'w') {
			if (state[data.lobby].player1ID === client.id && state[data.lobby].player1.y - PADDLE_SPEED > 0) {
				state[data.lobby].player1.speed = -Math.abs(PADDLE_SPEED);
			}
			else if (state[data.lobby].player2ID === client.id && state[data.lobby].player2.y - PADDLE_SPEED > 0) {
				state[data.lobby].player2.speed = -Math.abs(PADDLE_SPEED);
			}
		}
		else if (data.key === 's') {
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
		if (data.key === 'w') {
			if (state[data.lobby].player1ID === client.id) {
				state[data.lobby].player1.speed = 0;
			}
			else if (state[data.lobby].player2ID === client.id) {
				state[data.lobby].player2.speed = 0;
			}
		}
		else if (data.key === 's') {
			if (state[data.lobby].player1ID === client.id) {
					state[data.lobby].player1.speed = 0;
			}
			else if (state[data.lobby].player2ID === client.id) {
				state[data.lobby].player2.speed = 0;
			}
		}
	}

	@SubscribeMessage('pauseGame')
	handlePauseGame(@MessageBody() lobby: string) {
		this.server.to(lobby).emit('pausedGame');
	}

	@SubscribeMessage('startGame')
	handleStartGame(@MessageBody() lobby: string) {
		this.server.to(lobby).emit('startedGame');
	}

	@SubscribeMessage('restartGame')
	handleRestartGame(@MessageBody() lobby: string) {
		this.server.to(lobby).emit('restartedGame');
	}
}