import { Message } from './message.entity';

export class Chat {
  public userOneId: string;
  public userTwoId: string;
  public messages: Message[];
}
