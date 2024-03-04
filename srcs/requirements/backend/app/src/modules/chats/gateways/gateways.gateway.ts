import { OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { MessagePayloads } from '../types/messagePayloads.type';

@WebSocketGateway({ cors: true, namespace: 'chat' })
export class ChatGateway implements OnModuleInit {

	@WebSocketServer()
	server: Server;

	onModuleInit() {
		this.server.on('connection', (socket) => {
			this.server.emit('newUser', socket.id);
			console.log('new chat socket connection : ' + socket.id)
	
			socket.on('disconnect', () => {
				this.server.emit('userDisconnected', socket.id);
			});
		});
	}

	@SubscribeMessage('newMessage')
	handleNewMessage(@MessageBody() message: MessagePayloads, @ConnectedSocket() client: Socket) {
		client.to(message.channel).emit('onMessage', {
			content: message.content,
			sender_id: client.id,
			channel_id: message.channel,
			date: Date()
		});
	}
  
	@SubscribeMessage('createChannel')
	handleChannelCreate(@MessageBody() channel_name: string, @ConnectedSocket() client: Socket) {
		client.join(channel_name);
		this.server.to(channel_name).emit('createdChannel', channel_name);
	}
  
	@SubscribeMessage('joinChannel')
	handleChannelJoin(@MessageBody() channel_name: string, @ConnectedSocket() client: Socket) {
		client.join(channel_name);
		client.emit('joinedChannel', channel_name);
		this.server.to(channel_name).emit('userJoinedChannel', client.id);
	}
}