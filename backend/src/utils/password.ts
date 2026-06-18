import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

export const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, env.BCRYPT_ROUNDS);
export const verifyPassword = (password: string, hash: string): Promise<boolean> => bcrypt.compare(password, hash);
