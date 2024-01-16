import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io'
import { ServerToClientEvents } from '../types/chat';
import { Message } from 'src/utils/types';

@WebSocketGateway({namespace: 'chat'})
export class ChatGateway {
  @WebSocketServer()
  server: Server<any, ServerToClientEvents>;

  @SubscribeMessage('message')
  handleMessage(client: any, message: Message): string {
    this.server.emit('newMessage', message);
    return 'Hello world!';
  }

  sendMessage(message: Message) {
    this.server.emit('newMessage', message);
  }
}
