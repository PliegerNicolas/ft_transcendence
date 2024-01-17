import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io'
//import { ServerToClientEvents } from '../types/chat';
import { Message } from '../types/chat';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:8080']
  },
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
  handleNewMessage(@MessageBody() body: any) {
    console.log(body);
    this.server.emit('onMessage', {
      msg: 'New Message',
      content: body,
    });
  }

  sendMessage(message: Message) {
    this.server.emit('newMessage', message);
  }
}
