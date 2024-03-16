import { OnModuleInit, UseGuards, Request } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { gameState } from '../../game/types/inputPayloads'
import { GameServer } from '../../game/server/game.server'
import { PADDLE_SPEED, WINDOW_HEIGHT,  } from '../../game/server/game.constants'
import { MessagePayloads } from '../../chats/types/messagePayloads.type';
import { ChannelsService } from 'src/modules/chats/channels/services/channels/channels.service';

let state: gameState[] = [];
let player1ID: string[] = [];
let player2ID: string[] = [];
let playersQueue: string[] = [];
let player1Username: string[] = [];
let player2Username: string[] = [];

let userByName: string[] = [];
let userById: string[] = [];

@WebSocketGateway({ cors: true, namespace: 'socket' })
export class SocketGateway implements OnModuleInit {

	constructor(private readonly gameServer: GameServer,
				private readonly channelService: ChannelsService) {}

	@WebSocketServer()
	server: Server;

	onModuleInit() {
		this.server.on('connection', (socket) => {
			console.log('new socket connection : ' + socket.id);
			setTimeout(() => {this.server.to(socket.id).emit('getUserInfos');}, 100);
			socket.on('disconnect', () => {
				console.log(socket.id + ' left socket');
				this.server.emit('userLeftSocket', socket.id);
				var i = 0;
				while (playersQueue[i] && playersQueue[i] != socket.id) {
					i++;
				}
				if (playersQueue[i])
					playersQueue.splice(i, 1);
			});
		});
	}

	@SubscribeMessage('userInfos')
	handleGetUsername(@MessageBody() username: string, @ConnectedSocket() client: Socket) {
		console.log("----- USER INFOS -----");
		if (!userById[client.id]) {
			userByName[username] = client.id;
			userById[client.id] = username;
			console.log("USER : " + userById[client.id] + " with id : " + client.id + " has joined the socket !");
			this.channelService.getAllChannels(userById[client.id]).then((chan) => {
				for (let i = 0; chan[i]; i++) {
						console.log("CLIENT JOINED CHANNEL : " + chan[i].channel.name);
						client.join(chan[i].channel.name);
					}
				});
		}
	}

	@SubscribeMessage('rejoinChannels')
	handleRejoinChannels(@ConnectedSocket() client: Socket) {
		this.channelService.getAllChannels(userById[client.id]).then((channelSpec) => {
			for (let i = 0; channelSpec[i]; i++) {
				console.log("CLIENT JOINED CHANNEL : " + channelSpec[i].channel.name);
				client.join(channelSpec[i].channel.name);
			}
		});
	}

	// Chat Handlers ==============================================================================================================	

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

	// Private Play Handlers ==============================================================================================================

	@SubscribeMessage('inviteToPrivate')
	handleInviteToPrivate(@MessageBody() data: {user: string, lobby: string}, @ConnectedSocket() client: Socket) {
		console.log("INVITING USER : " + data.user + " WITH ID : " + userByName[data.user]);
		if (userByName[data.user]) {
			console.log("oui");
			this.server.to(userByName[data.user]).emit('invitedToPrivate', userById[client.id], data.lobby);
		}
	}

	@SubscribeMessage('acceptInvite')
	handleAcceptInvite(@MessageBody() data: {user: string, lobby: string}, @ConnectedSocket() client: Socket) {
		console.log("USER : " + data.user + " INVITATION HAS BEEN ACCEPTED BY : " + userById[client.id]);
		if (userByName[data.user]) {
			console.log("caca");
			this.server.to(userByName[data.user]).emit('inviteAccepted', userById[client.id], data.lobby);
		}
	}

	@SubscribeMessage('rejectInvite')
	handleRejectInvite(@MessageBody() data: {user: string, lobby: string}, @ConnectedSocket() client: Socket) {
		console.log("USER : " + data.user + " INVITATION HAS BEEN REFUSED BY : " + userById[client.id]);
		if (userByName[data.user]) {
			console.log("caca");
			this.server.to(userByName[data.user]).emit('inviteRejected', userById[client.id], data.lobby);
		}
	}

	// Play Handlers ==============================================================================================================

	@SubscribeMessage('opponentLeft')
	handleOpponentLeft(@MessageBody() data: {userId: string, lobby: string}, @ConnectedSocket() client: Socket) {
		if (player1ID[data.lobby] === data.userId) {
			if (state[data.lobby]) {
				state[data.lobby].score.player2 = 5;
			}
			player1ID = player1ID.filter((id) => id != data.userId);
		}
		else if (player2ID[data.lobby] === data.userId) {
			if (state[data.lobby]) {
				state[data.lobby].score.player1 = 5;
			}
			player2ID = player2ID.filter((id) => id != data.userId);
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
		this.gameServer.matchmakingSystem(playersQueue, i, this.server);
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
			this.server.to(data.lobby).emit(
				'gameReady',
				player1Username[data.lobby],
				player2Username[data.lobby],
				player1ID[data.lobby],
				player2ID[data.lobby]
			);
			setTimeout(() => {this.server.to(data.lobby).emit('startedGame')}, 200);
			state[data.lobby] = this.gameServer.createGameState();
			state[data.lobby].player1ID = player1ID[data.lobby];
			state[data.lobby].player2ID = player2ID[data.lobby];
			setTimeout(() => {this.gameServer.startGameInterval(data.lobby, state[data.lobby], this.server, player1Username[data.lobby], player2Username[data.lobby])}, 3200);
		}
	}

	@SubscribeMessage('notReady')
	handleNotReady(@MessageBody() data: {lobby: string, playerNumber: number}, @ConnectedSocket() client: Socket) {
		if (player1ID[data.lobby] && data.playerNumber === 1) {
			console.log('NOT READY : ' + client.id);
   			player1ID = player1ID.filter((id) => id != client.id);
			console.log('player1ID should be null/undefined : ' + player1ID[data.lobby]);
			client.leave(data.lobby);
		}
		else if (player2ID[data.lobby]  && data.playerNumber === 2) {
			console.log('NOT READY : ' + client.id);
			player2ID = player2ID.filter((id) => id != client.id);
			console.log('player2ID should be null/undefined : ' + player2ID[data.lobby]);
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

	@SubscribeMessage('gameEnded')
	handleSentLogs(@MessageBody() lobby: string) {
		this.server.to(lobby).emit('drawEndGame', state[lobby]);
	}
}