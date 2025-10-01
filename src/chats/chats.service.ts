import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

type ConnectedClients = {
  [id: string]: {
    socket: Socket;
    user: User;
  };
};

@Injectable()
export class ChatsService {
  public constructor(private readonly userService: UsersService) {}

  private connectedClients: ConnectedClients = {};

  public async registerClient(client: Socket, userEmail: string) {
    const user = await this.userService.findByEmail(userEmail, []);

    if (!user) throw new Error('User not found');

    this.checkUserConnection(user);

    this.connectedClients[user.id as string] = {
      socket: client,
      user,
    };
  }

  public removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  public getConnectedClients() {
    return Object.values(this.connectedClients).map((client) => ({
      id: client.user._id,
      fullName: client.user.fullName,
    }));
  }

  public getUserBySocketId(socketId: string) {
    return this.connectedClients[socketId];
  }

  private checkUserConnection(user: User) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedClient = this.connectedClients[clientId];

      if (connectedClient.user.id === user.id) {
        connectedClient.socket.disconnect();
        break;
      }
    }
  }
}
