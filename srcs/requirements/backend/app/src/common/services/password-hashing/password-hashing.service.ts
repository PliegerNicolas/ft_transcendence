import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'

@Injectable()
export class PasswordHashingService {

    private readonly saltRounds: number = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;

    // Random crashing ???
    async hashPassword(password: string): Promise<string> {
        return (await bcrypt.hash(password, this.saltRounds));
    }

    async comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
        return (await bcrypt.compare(plainTextPassword, hashedPassword));
    }

}
