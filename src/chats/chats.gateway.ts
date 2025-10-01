import {
  ConnectedSocket,
  MessageBody,
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
    } catch {
      client.emit('error', {
        message: 'Invalid token',
        status: HttpStatus.UNAUTHORIZED,
      });

      client.disconnect();
      return;
    }

    const chats = await this.chatsService.getChatsBySocketId(client.id);

    for (const chat of chats) {
      // Usa el ID del chat como nombre de la sala
      const chatId = chat._id?.toString();

      if (!chatId) continue;

      await client.join(chatId);
      console.log(`[AUTO-JOIN] Cliente ${client.id} unido a chat: ${chat.id}`);
    }

    this.webSocketServer.emit('connected-clients', chats);
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
      const sender = this.chatsService.getUserBySocketId(client.id);
      const senderId = sender?.user.id as string;

      if (!senderId) throw new Error('Sender not found');

      const newMessage = await this.chatsService.sendMessage(
        senderId,
        payload.chatId,
        payload.message,
      );

      const confirmedMessage = {
        ...newMessage,
        tempId: payload.temporalId, // Asume que payload trae el tempId
      };

      client.emit('confirmed-message', confirmedMessage);

      client
        .to(newMessage.chatId.toString())
        .emit('message-from-server', newMessage);
    } catch (error) {
      if (error instanceof Error) {
        client.emit('error', {
          message: error.message,
          status: HttpStatus.BAD_REQUEST,
        });
      }
    }
  }

  @SubscribeMessage('join-chat')
  public async handleJoinChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    if (chatId) {
      // El nombre de la sala debe ser el ID de la conversación.
      await client.join(chatId.toString());
      console.log(`[ROOMS] Cliente ${client.id} unido a sala: ${chatId}`);
    }
  }
}
