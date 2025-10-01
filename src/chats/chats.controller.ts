import { Controller, Get, Param } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('chats')
export class ChatsController {
  public constructor(private readonly chatsService: ChatsService) {}

  @Get('my-chats')
  @Auth()
  public async getMyChats(@GetUser() user: AuthenticatedUser) {
    return this.chatsService.getMyChats(user);
  }

  @Get('/my-chats/:chatId/messages')
  @Auth()
  async getMessages(
    @Param('chatId') chatId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.chatsService.getMessagesByChatId(chatId, user);
  }
}
