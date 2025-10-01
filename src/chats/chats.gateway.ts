import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatsService } from './chats.service';
import { Socket, Server } from 'socket.io';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus } from '@nestjs/common';
import { NewMessageDTO } from './dto/new-message.dto';

@WebSocketGateway({ cors: { origin: '*' }, transports: ['websocket'] })
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  public constructor(
    private readonly chatsService: ChatsService,
    private readonly jwtService: JwtService,
  ) {}

  @WebSocketServer()
  public webSocketServer: Server;

  public async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.query.token as string;

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verify(token ?? '');

      await this.chatsService.registerClient(client, payload.email);
    } catch (error) {
      console.error(error);
      client.emit('error', {
        message: 'Invalid token',
        status: HttpStatus.UNAUTHORIZED,
      });

      client.disconnect();
      return;
    }

    const clients = await this.chatsService.getChatsBySocketId(client.id);

    this.webSocketServer.emit('connected-clients', clients);
  }

  public handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado: ',  client.id)
    this.chatsService.removeClient(client.id);

    const clients = this.chatsService.getConnectedClients();

    this.webSocketServer.emit('clients-updated', clients);
  }

  @SubscribeMessage('send-message')
  public async onMessageFromClient(client: Socket, payload: NewMessageDTO) {
    try {
      const newMessage = await this.chatsService.sendMessage(
        client.id,
        payload.chatId,
        payload.message,
      );

      client.broadcast.emit('message-from-server', newMessage);
    } catch (error) {
      if (error instanceof Error) {
        client.emit('error', {
          message: error.message,
          status: HttpStatus.BAD_REQUEST,
        });
      }
    }
  }
}
