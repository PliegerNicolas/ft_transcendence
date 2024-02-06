import { OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { Ball, Player, InputPayloads } from '../types/inputPayloads'

@WebSocketGateway({ cors: true, namespace: 'game' })
export class GameGateway implements OnModuleInit {

	@WebSocketServer()
	server: Server;

	onModuleInit() {
		this.server.on('connection', (socket) => {
			this.server.to(socket.id).emit('connected', socket.id);
			console.log(socket.id);
			socket.on('disconnect', () => {
				this.server.emit('userLeftLobby', socket.id);
			});
		});
	}
  
	@SubscribeMessage('createLobby')
	handleLobbyCreate(@MessageBody() lobby_name: string, @ConnectedSocket() client: Socket) {
		client.join(lobby_name);
		this.server.to(lobby_name).emit('createdLobby', lobby_name);
	}
  
	@SubscribeMessage('joinLobby')
	handleLobbyJoin(@MessageBody() lobby_name: string, @ConnectedSocket() client: Socket) {
		client.join(lobby_name);
		client.emit('joinedLobby', lobby_name);
		this.server.to(lobby_name).emit('userJoinedLobby', client.id);
	}

	@SubscribeMessage('updateGame')
	handleUpdateGame(@MessageBody() game_props: InputPayloads, @ConnectedSocket() client: Socket) {
		this.server.emit('updatedGame', game_props.ball, game_props.player1, game_props.player2);
	}

	@SubscribeMessage('pauseGame')
	handlePauseGame() {
		this.server.emit('pausedGame');
	}

	@SubscribeMessage('startGame')
	handleStartGame() {
		this.server.emit('startedGame');
	}

	@SubscribeMessage('restartGame')
	handleRestartGame() {
		this.server.emit('restartedGame');
	}
}