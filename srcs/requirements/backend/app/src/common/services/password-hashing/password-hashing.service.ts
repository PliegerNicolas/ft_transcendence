import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'

@Injectable()
export class PasswordHashingService {

    private readonly saltRounds: number = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;

    async hashPassword(password: string = undefined): Promise<string> {
        if (!password) return (null);
        return (await bcrypt.hash(password, this.saltRounds));
    }

    async comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
        return (await bcrypt.compare(plainTextPassword, hashedPassword));
    }

}
