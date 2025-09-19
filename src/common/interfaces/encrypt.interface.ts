export interface EncryptPasswordAdapter {
  encrypt(password: string): Promise<string>;
  compare(password: string, hashed: string): Promise<boolean>;
}

export const ENCRYPT_ADAPTER_TOKEN = 'ENCRYPT_ADAPTER';
