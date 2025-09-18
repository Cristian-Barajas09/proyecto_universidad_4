import { Injectable } from '@nestjs/common';
import { EncryptPasswordAdapter } from '../interfaces/encrypt.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptAdapter implements EncryptPasswordAdapter {
  public async encrypt(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  public async compare(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }
}
