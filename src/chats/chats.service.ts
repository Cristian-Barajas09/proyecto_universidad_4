import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Socket } from 'socket.io';
import { User } from 'src/users/entities/user.entity';
import { Chat } from './entities/chat.entity';
import { Model, Types } from 'mongoose';
import { Message } from './entities/message.entity';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

type ConnectedClients = {
  [id: string]: {
    socket: Socket;
    user: User;
  };
};

@Injectable()
export class ChatsService {
  public constructor(
    @InjectModel(Chat.name)
    private readonly chatModel: Model<Chat>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
  ) {}

  private connectedClients: ConnectedClients = {};

  public async registerClient(client: Socket, userEmail: string) {
    const user = await this.userModel.findOne({ email: userEmail }).exec();

    if (!user) throw new Error('User not found');

    this.checkUserConnection(user);

    this.connectedClients[client.id] = {
      socket: client,
      user,
    };
  }

  public async createChat(participants: Types.ObjectId[]): Promise<Chat> {
    const newChat = new this.chatModel({ participants });
    return await newChat.save();
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

  public async getChatsBySocketId(socketId: string) {
    const client = this.getUserBySocketId(socketId);
    if (!client) return [];

    return this.chatModel
      .find({ participants: client.user._id })
      .populate({ path: 'participants', select: 'fullName email' })
      .exec();
  }

  public async sendMessage(senderId: string, chatId: string, text: string) {
    const chat = await this.chatModel
      .findById(chatId)
      .populate('participants', 'fullName email')
      .exec();
    if (!chat) throw new Error('Chat not found');

    const sender = await this.userModel.findById(senderId).exec();
    if (!sender) throw new Error('Sender not found');

    if (
      !chat.participants.find(
        (p) => p._id.toString() === sender._id?.toString(),
      )
    ) {
      throw new Error('User not in chat');
    }

    // Al guardar el mensaje
    const savedMessage = await this.messageModel.create({
      chatId,
      sender: sender._id,
      text,
    });

    chat.messages.push(savedMessage._id as Types.ObjectId);
    await chat.save();

    const populatedMessage = await savedMessage.populate<{
      sender: User;
    }>('sender');

    // Devuelve un objeto plano y limpio
    return {
      _id: populatedMessage._id,
      chatId: populatedMessage.chatId,
      text: populatedMessage.text,
      sender: {
        _id: populatedMessage.sender._id,
        fullName: populatedMessage.sender.fullName,
        email: populatedMessage.sender.email,
      },
      createdAt: populatedMessage.createdAt,
    };
  }

  public getUserBySocketId(socketId: string) {
    return this.connectedClients[socketId];
  }

  public async getMyChats(user: AuthenticatedUser) {
    const chats = await this.chatModel
      .find({ participants: user._id })
      .populate<{
        participants: User[];
      }>({ path: 'participants', select: 'fullName email' })
      .populate<{
        messages: Message[];
      }>({
        path: 'messages',
        populate: { path: 'sender', select: 'fullName email' },
      })
      .exec();

    return chats;
  }

  public async getMessagesByChatId(chatId: string, user: AuthenticatedUser) {
    const chat = await this.chatModel
      .findById(chatId)
      .populate('participants', 'fullName email')
      .exec();
    if (!chat) throw new Error('Chat not found');

    if (
      !chat.participants.find((p) => p._id.toString() === user._id?.toString())
    ) {
      throw new Error('User not in chat');
    }

    return this.messageModel
      .find({ chatId })
      .populate('sender', 'fullName email')
      .sort({ createdAt: 1 }) // orden cronológico ascendente
      .exec();
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
