import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'

@Injectable()
export class PasswordHashingService {

    private readonly saltRounds: number = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;

    async hashPassword(password: string = undefined): Promise<string> {
        if (!password) return (null);
        const trimmedPassword = password.trim();
        return (await bcrypt.hash(trimmedPassword, this.saltRounds));
    }

    // Not working ?
    async comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
        const trimmedPlainTextPassword = plainTextPassword.trim();
        const a = await bcrypt.compare(trimmedPlainTextPassword, hashedPassword);
        return (a);
    }

}
