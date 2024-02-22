import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2'

@Injectable()
export class PasswordHashingService {

    async hashPassword(password: string): Promise<string> {
        try {
            if (!password) return null;
            return await argon2.hash(password);
        } catch (error) {
            console.error('Error hashing password:', error);
            throw error;
        }
    }

    // Not working ?
    async comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
        return (argon2.verify(hashedPassword, plainTextPassword));
    }

}
