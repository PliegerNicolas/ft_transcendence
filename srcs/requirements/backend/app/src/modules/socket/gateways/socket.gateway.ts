import { OnModuleInit, UseGuards, Request } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { gameState } from '../../game/types/inputPayloads'
import { GameServer } from '../../game/server/game.server'
import { PADDLE_SPEED, WINDOW_HEIGHT,  } from '../../game/server/game.constants'
import { MessagePayloads } from '../../chats/types/messagePayloads.type';
import { ChannelsService } from 'src/modules/chats/channels/services/channels/channels.service';
import { timer } from 'rxjs';

let state = new Map<string, gameState>();
let player1ID = new Map<string, string>();
let player2ID = new Map<string, string>();
let playersQueue: string[] = [];
let player1Username = new Map<string, string>();
let player2Username = new Map<string, string>();

let userByName = new Map<string, string>();
let userById = new Map<string, string>();

@WebSocketGateway({ cors: true, namespace: 'socket' })
export class SocketGateway implements OnModuleInit {

	constructor(private readonly gameServer: GameServer,
				private readonly channelService: ChannelsService) {}

	@WebSocketServer()
	server: Server;

	onModuleInit() {
		this.server.on('connection', (socket) => {
			// console.log('new socket connection : ' + socket.id);
			this.server.to(socket.id).emit('getUserInfos');
			socket.on('disconnect', () => {
				// console.log(socket.id + ' left socket');
				this.server.emit('userLeftSocket', socket.id);
				this.server.emit('userStatus', userById.get(socket.id), "offline");
				playersQueue = playersQueue.filter((id) => id != socket.id);
				userByName.delete(userById.get(socket.id));
				userById.delete(socket.id);
			});
		});
	}

	@SubscribeMessage('userInfos')
	handleGetUsername(@MessageBody() username: string, @ConnectedSocket() client: Socket) {
		if (!userById.has(client.id)) {
			userByName.set(username, client.id);
			userById.set(client.id, username);
			//console.log("USER : " + userById.get(client.id) + " with id : " + client.id + " has joined the socket !");
			this.channelService.getAllChannels(userById.get(client.id)).then((chan) => {
				for (let i = 0; chan[i]; i++) {
						// console.log("CLIENT JOINED CHANNEL : " + chan[i].channel.name);
						client.join(chan[i].channel.name);
					}
			});
		}
		if (userById.has(client.id)) {
			setTimeout(() => {this.server.emit('userStatus', username, "online");}, 200);
			//console.log("sent online to server");
		}
	}

	@SubscribeMessage('rejoinChannels')
	handleRejoinChannels(@MessageBody() username: string, @ConnectedSocket() client: Socket) {
		this.channelService.getAllChannels(userById.get(client.id)).then((channelSpec) => {
			for (let i = 0; channelSpec[i]; i++) {
				// console.log("CLIENT JOINED CHANNEL : " + channelSpec[i].channel.name);
				client.join(channelSpec[i].channel.name);
			}
		});
	}

	@SubscribeMessage('newUsername')
	handleNewUsername(@MessageBody() username: string, @ConnectedSocket() client: Socket) {
		if (userById.get(client.id)) {
			userByName.delete(userById.get(client.id));
			userByName.set(username, client.id);
			userById.set(client.id, username);
			this.server.emit('userStatut', userById.get(client.id), "online");
			// console.log("USER : " + userById.get(client.id) + " with id : " + client.id + " has changed name !");
		}
	}

	@SubscribeMessage('logOut')
	handleLogOut(@ConnectedSocket() client: Socket) {
		// console.log("LOG OUT");
		this.server.emit('userStatus', userById.get(client.id), "offline");
		playersQueue = playersQueue.filter((id) => id != client.id);
		userByName.delete(userById.get(client.id));
		userById.delete(client.id);
	}

	@SubscribeMessage('getUserStatus')
	handleGetUserStatut(@MessageBody() username: string, @ConnectedSocket() client: Socket) {
		let check: boolean = false;

		for (let value of player1ID.values()) {
			if (value === userByName.get(username)) {
				this.server.to(client.id).emit('userStatus', username, "in game");
				check = true;
			}
		}
		for (let value of player2ID.values()) {
			if (value === userByName.get(username)) {
				this.server.to(client.id).emit('userStatus', username, "in game");
				check = true;
			}
		}

		if (check) return ;

		if (userByName.has(username)) {
			this.server.emit('userStatus', username, "online");
			//console.log("ONLINE OUIIIIIIIIII " + userById.get(client.id));
		}
		else {
			this.server.emit('userStatus', username, "offline");
			//console.log("OFFLINE FFFFFFFFFFFFFFFF" + userById.get(client.id));
		}
	}

	// Chat Handlers ==============================================================================================================	

	@SubscribeMessage('newMessage')
	handleNewMessage(@MessageBody() message: MessagePayloads, @ConnectedSocket() client: Socket) {
		client.to(message.channel).emit('onMessage', message.content, message.channel);
		// console.log('NEW MESSAGE HANDLED : ' + message.content);
	}
  
	@SubscribeMessage('joinChannel')
	handleChannelJoin(@MessageBody() channel: string, @ConnectedSocket() client: Socket) {
		client.join(channel);
		//console.log('JOINED CHANNEL : ' + channel);
	}

	@SubscribeMessage('refreshClientPage')
	handleRefreshClientPage(@MessageBody() data: {user: string, timer: number}, @ConnectedSocket() client: Socket) {
		setTimeout(() => {this.server.to(userByName[data.user]).emit('refreshPage')}, data.timer);
	}

	@SubscribeMessage('newChannel')
	handleNewChannel(@ConnectedSocket() client: Socket) {
		this.server.emit('refreshChannels');
	}

	@SubscribeMessage('channelAction')
	handleChannelAction(@ConnectedSocket() client: Socket) {
		//console.log("OUUUAIS SUUUPEPPERRR!!!");
		this.server.emit('updateChannel');
	}

	// Private Play Handlers ==============================================================================================================

	@SubscribeMessage('inviteToPrivate')
	handleInviteToPrivate(@MessageBody() data: {user: string, lobby: string}, @ConnectedSocket() client: Socket) {
		// console.log(userById.get(client.id) + " IS INVITING USER : " + data.user + " WITH ID : " + userByName.get(data.user));
		if (userByName.has(data.user)) {
			this.server.to(userByName.get(data.user)).emit('invitedToPrivate', userById.get(client.id), data.lobby);
		}
	}

	@SubscribeMessage('acceptInvite')
	handleAcceptInvite(@MessageBody() data: {user: string, lobby: string}, @ConnectedSocket() client: Socket) {
		// console.log("USER : " + data.user + " INVITATION HAS BEEN ACCEPTED BY : " + userById.get(client.id));
		if (userByName.has(data.user)) {
			this.server.to(userByName.get(data.user)).emit('inviteAccepted', userById.get(client.id), data.lobby);
		}
	}

	@SubscribeMessage('rejectInvite')
	handleRejectInvite(@MessageBody() data: {user: string, lobby: string}, @ConnectedSocket() client: Socket) {
		// console.log("USER : " + data.user + " INVITATION HAS BEEN REFUSED BY : " + userById.get(client.id));
		if (userByName.has(data.user)) {
			this.server.to(userByName.get(data.user)).emit('inviteRejected', userById.get(client.id), data.lobby);
		}
	}

	@SubscribeMessage('refreshLobby')
	handleRefreshLobby(@MessageBody() data: {lobby: string, playerNumber: number}, @ConnectedSocket() client: Socket) {
		// console.log("USER : " + userById.get(client.id) + " LOBBY HAS BEEN REFRESHED");
		if (userById.has(client.id)) {
			this.server.to(client.id).emit('changeLobby', data.lobby, data.playerNumber);
		}
	}

	// Play Handlers ==============================================================================================================

	@SubscribeMessage('opponentLeft')
	handleOpponentLeft(@MessageBody() data: {userId: string, lobby: string}, @ConnectedSocket() client: Socket) {
		if (player1ID.get(data.lobby) === data.userId) {
			if (state.has(data.lobby)) {
				state.get(data.lobby).score.player2 = 5;
			}
			player1ID.delete(data.userId);
		}
		else if (player2ID.get(data.lobby) === data.userId) {
			if (state.has(data.lobby)) {
				state.get(data.lobby).score.player1 = 5;
			}
			player2ID.delete(data.userId);
		}
		if (!state.has(data.lobby))
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
		if (!player1ID.has(data.lobby) && data.playerNumber === 1) {
			player1ID.set(data.lobby, client.id);
			player1Username.set(data.lobby, data.playerName);
			client.join(data.lobby);
		}
		else if (!player2ID.has(data.lobby) && data.playerNumber === 2) {
			player2ID.set(data.lobby, client.id);
			player2Username.set(data.lobby, data.playerName);
			client.join(data.lobby);
		}
		if (player1ID.has(data.lobby) && player2ID.has(data.lobby)) {
			this.server.to(data.lobby).emit(
				'gameReady',
				player1Username.get(data.lobby),
				player2Username.get(data.lobby),
				player1ID.get(data.lobby),
				player2ID.get(data.lobby)
			);
			setTimeout(() => {this.server.to(data.lobby).emit('startedGame')}, 200);
			this.server.emit('userStatus', player1Username.get(data.lobby), "in game");
			this.server.emit('userStatus', player2Username.get(data.lobby), "in game");
			state.set(data.lobby, this.gameServer.createGameState());
			state.get(data.lobby).player1ID = player1ID.get(data.lobby);
			state.get(data.lobby).player2ID = player2ID.get(data.lobby);
			setTimeout(() => {this.gameServer.startGameInterval(data.lobby, state.get(data.lobby), this.server, player1Username.get(data.lobby), player2Username.get(data.lobby))}, 3200);
		}
	}

	@SubscribeMessage('notReady')
	handleNotReady(@MessageBody() data: {lobby: string, playerNumber: number}, @ConnectedSocket() client: Socket) {
		if (player1ID.has(data.lobby) && data.playerNumber === 1) {
			// console.log('NOT READY : ' + client.id);
   			player1ID.delete(data.lobby);
			// console.log('player1ID should be null/undefined : ' + player1ID.get(data.lobby));
			client.leave(data.lobby);
		}
		else if (player2ID.has(data.lobby)  && data.playerNumber === 2) {
			// console.log('NOT READY : ' + client.id);
			player2ID.delete(data.lobby);
			// console.log('player2ID should be null/undefined : ' + player2ID.get(data.lobby));
			client.leave(data.lobby);
		}
	}

	@SubscribeMessage('keyDown')
	handleKeyDown(@MessageBody() data: {key: string, lobby: string}, @ConnectedSocket() client: Socket) {
		if (data.key === 'w' || data.key === 'ArrowUp') {
			if (state.get(data.lobby).player1ID === client.id && state.get(data.lobby).player1.y - PADDLE_SPEED > 0) {
				state.get(data.lobby).player1.speed = -Math.abs(PADDLE_SPEED);
			}
			else if (state.get(data.lobby).player2ID === client.id && state.get(data.lobby).player2.y - PADDLE_SPEED > 0) {
				state.get(data.lobby).player2.speed = -Math.abs(PADDLE_SPEED);
			}
		}
		else if (data.key === 's' || data.key === 'ArrowDown') {
			if (state.get(data.lobby).player1ID === client.id && state.get(data.lobby).player1.y + PADDLE_SPEED < WINDOW_HEIGHT) {
				state.get(data.lobby).player1.speed = Math.abs(PADDLE_SPEED);
			}
			else if (state.get(data.lobby).player2ID === client.id && state.get(data.lobby).player2.y + PADDLE_SPEED < WINDOW_HEIGHT) {
				state.get(data.lobby).player2.speed = Math.abs(PADDLE_SPEED);
			}
		}
	}

	@SubscribeMessage('keyUp')
	handleKeyUp(@MessageBody() data: {key: string, lobby: string}, @ConnectedSocket() client: Socket) {
		if (data.key === 'w' || data.key === 'ArrowUp') {
			if (state.get(data.lobby).player1ID === client.id) {
				state.get(data.lobby).player1.speed = 0;
			}
			else if (state.get(data.lobby).player2ID === client.id) {
				state.get(data.lobby).player2.speed = 0;
			}
		}
		else if (data.key === 's' || data.key === 'ArrowDown') {
			if (state.get(data.lobby).player1ID === client.id) {
					state.get(data.lobby).player1.speed = 0;
			}
			else if (state.get(data.lobby).player2ID === client.id) {
				state.get(data.lobby).player2.speed = 0;
			}
		}
	}

	@SubscribeMessage('leaveLobby')
	handleLeaveLobby(@MessageBody() lobby: string, @ConnectedSocket() client: Socket) {
		if (player1ID.has(lobby)) {
			player1ID.delete(lobby);
		}
		else if (player2ID.has(lobby)) {
			player2ID.delete(lobby);
		}
		client.leave(lobby);
	}

	@SubscribeMessage('gameEnded')
	handleSentLogs(@MessageBody() lobby: string, @ConnectedSocket() client: Socket) {
		this.server.to(lobby).emit('drawEndGame', state.get(lobby));
		if (player1ID.has(lobby)) {
			this.server.emit('userStatus', userById.get(client.id), "online");
			player1ID.delete(lobby);
		}
		else if (player2ID.has(lobby)) {
			this.server.emit('userStatus', userById.get(client.id), "online");
			player2ID.delete(lobby);
		}
	}
}