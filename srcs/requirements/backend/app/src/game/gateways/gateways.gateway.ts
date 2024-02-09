import { OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { Ball, Player, gameState } from '../types/inputPayloads'
import { createGameState, startGameInterval } from '../server/game.server'
import { PADDLE_SPEED, WINDOW_HEIGHT,  } from '../server/game.constants'

let state: gameState = null;
let player1ID: string;
let player2ID: string;

@WebSocketGateway({ cors: true, namespace: 'game' })
export class GameGateway implements OnModuleInit {

	@WebSocketServer()
	server: Server;

	onModuleInit() {
		this.server.on('connection', (socket) => {
			console.log('new connection : ' + socket.id)
			socket.on('disconnect', () => {
				this.server.emit('userLeftServer', socket.id);
			});
		});
	}
  
	@SubscribeMessage('createLobby')
	handleLobbyCreate(@MessageBody() lobby_name: string, @ConnectedSocket() client: Socket) {
		client.join(lobby_name);
		this.server.to(lobby_name).emit('createdLobby', lobby_name);
		player1ID = client.id;
	}

	@SubscribeMessage('getLobbyList')
	handleGetLobbyList(@ConnectedSocket() client: Socket) {
		client.emit('lobbyList', this.server.sockets.adapter.rooms);
	}
  
	@SubscribeMessage('joinLobby')
	handleLobbyJoin(@MessageBody() lobby_name: string, @ConnectedSocket() client: Socket) {
		//if (player1ID && player2ID) {
		//	client.emit('lobbyFull', lobby_name);
		//}
		//else {
			client.join(lobby_name);
			client.emit('joinedLobby', lobby_name);
			this.server.to(lobby_name).emit('userJoinedLobby', client.id);
			player2ID = client.id;
		//}
	}

	@SubscribeMessage('leftLobby')
	handleLobbyLeft(@MessageBody() lobby_name: string, @ConnectedSocket() client: Socket) {
		client.leave(lobby_name);
		this.server.to(lobby_name).emit('userLeftLobby', client.id);
		if (player1ID === client.id) {
			player1ID = null;
		}
		else if (player2ID === client.id) {
			player2ID = null;
		}
	}

	@SubscribeMessage('playerDisconnect')
	handlePlayerDisconnect(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
		if (player1ID === userId) {
			if (state) {
				state.score.player2 = 5;
			}
			player1ID = null;
		}
		else if (player2ID === userId) {
			if (state) {
				state.score.player1 = 5;
			}
			player2ID = null;
		}
	}

	@SubscribeMessage('initGame')
	handleInitGame(@MessageBody() lobby: string, @ConnectedSocket() client: Socket) {
		if (player1ID && player2ID) {
			this.server.to(lobby).emit('startedGame');
			state = createGameState();
			state.player1ID = player1ID;
			state.player2ID = player2ID;
			startGameInterval(lobby, state, this.server);
		}
	}

	@SubscribeMessage('keyDown')
	handleKeyDown(@MessageBody() key: string, @ConnectedSocket() client: Socket) {
		if (key === 'w') {
			if (state.player1ID === client.id && state.player1.y - PADDLE_SPEED > 0) {
				state.player1.speed = -Math.abs(PADDLE_SPEED);
			}
			else if (state.player2ID === client.id && state.player2.y - PADDLE_SPEED > 0) {
				state.player2.speed = -Math.abs(PADDLE_SPEED);
			}
		}
		else if (key === 's') {
			if (state.player1ID === client.id && state.player1.y + PADDLE_SPEED < WINDOW_HEIGHT) {
				state.player1.speed = Math.abs(PADDLE_SPEED);
			}
			else if (state.player2ID === client.id && state.player2.y + PADDLE_SPEED < WINDOW_HEIGHT) {
				state.player2.speed = Math.abs(PADDLE_SPEED);
			}
		}
	}

	@SubscribeMessage('keyUp')
	handleKeyUp(@MessageBody() key: string, @ConnectedSocket() client: Socket) {
		if (key === 'w') {
			if (state.player1ID === client.id) {
				state.player1.speed = 0;
			}
			else if (state.player2ID === client.id) {
				state.player2.speed = 0;
			}
		}
		else if (key === 's') {
			if (state.player1ID === client.id) {
					state.player1.speed = 0;
			}
			else if (state.player2ID === client.id) {
				state.player2.speed = 0;
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