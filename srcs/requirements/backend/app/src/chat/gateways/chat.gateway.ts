import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io'
import { ServerToClientEvents } from '../types/chat';
import { Message } from 'src/utils/types';

@WebSocketGateway({namespace: 'chat'})
export class ChatGateway {
  @WebSocketServer()
  server: Server<any, ServerToClientEvents>;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  sendMessage(message: Message) {
    this.server.emit('newMessage', message);
  }
}
