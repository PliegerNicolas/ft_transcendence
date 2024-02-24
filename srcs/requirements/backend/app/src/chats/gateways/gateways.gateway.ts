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
			console.log('new chat socket connection : ' + socket.id);
			this.server.to(socket.id).emit('rejoinChannels');
			console.log('new chat socket connection : ' + socket.id)

			socket.on('disconnect', () => {
				this.server.emit('userDisconnected', socket.id);
			});
		});
	}

	@SubscribeMessage('newMessage')
	handleNewMessage(@MessageBody() message: MessagePayloads, @ConnectedSocket() client: Socket) {
		client.to(message.channel).emit('onMessage', message.content, message.channel);
		console.log('NEW MESSAGE HANDLED : ' + message.content);
	}
  
	@SubscribeMessage('joinChannel')
	handleChannelJoin(@MessageBody() channel: string, @ConnectedSocket() client: Socket) {
		client.join(channel);
		console.log('JOINED CHANNEL : ' + channel);
	}
}