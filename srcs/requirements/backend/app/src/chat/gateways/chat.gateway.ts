import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
//import { ServerToClientEvents } from '../types/chat';
import { Message } from '../types/chat';
import { OnModuleInit } from '@nestjs/common';


@WebSocketGateway({
  cors: true,
  namespace: 'chat'
})
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;//<any, ServerToClientEvents>;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('Connected');
    });
  }

  @SubscribeMessage('newMessage')
  handleNewMessage(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
    console.log(body);
    this.server.emit('onMessage', {
      content: body,
      sender_id: client.id,
      channel_id: 1,
      date: Date()
    });
  }

  sendMessage(message: Message) {
    this.server.emit('newMessage', message);
  }
}
