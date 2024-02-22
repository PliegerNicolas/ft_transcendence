import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHashingService {

    private readonly saltRounds: number = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;

    async hashPassword(password: string): Promise<string> {
        if (!password) return (null);
        console.log(password);
        console.log(this.saltRounds);
        return (await bcrypt.hash(password, 12));
    }

    async comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
        return (await bcrypt.compare(plainTextPassword, hashedPassword));
    }

}
