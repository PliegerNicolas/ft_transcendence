import { OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { InputPayloads } from '../types/inputPayloads'

@WebSocketGateway({ cors: true, namespace: 'game' })
export class GameGateway implements OnModuleInit {

	@WebSocketServer()
	server: Server;

	onModuleInit() {
		this.server.on('connection', (socket) => {
			this.server.emit('newUser', socket.id);
	
			socket.on('disconnect', () => {
				this.server.emit('userDisconnected', socket.id);
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

	@SubscribeMessage('gameInput')
	handleGameInput(@MessageBody() input: InputPayloads, @ConnectedSocket() client: Socket) {
		
	}
}