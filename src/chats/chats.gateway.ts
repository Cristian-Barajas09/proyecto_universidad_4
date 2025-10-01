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
    console.log('Cliente conectado: ', client.id);
    console.log(client.handshake.query);
    console.log(args);

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

    const clients = this.chatsService.getConnectedClients();

    console.log(clients);

    this.webSocketServer.emit('connected-clients', clients);
  }

  public handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado: ',  client.id)
    this.chatsService.removeClient(client.id);

    const clients = this.chatsService.getConnectedClients();

    this.webSocketServer.emit('clients-updated', clients);
  }

  @SubscribeMessage('message-from-client')
  public onMessageFromClient(client: Socket, payload: NewMessageDTO) {
    const thisClient = this.chatsService.getUserBySocketId(client.id);

    this.webSocketServer.emit('message-from-server', {
      fullName: thisClient.user.fullName,
      message: payload.message,
    });
  }
}
