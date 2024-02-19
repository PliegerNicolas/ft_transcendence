import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt' as bcrypt;

@Injectable()
export class PasswordHashingService {

    private readonly saltRounds: number = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;

    // Random crashing ???
    async hashPassword(password: string): Promise<string> {
        console.log("b");
        const a = await bcrypt.hash(password, this.saltRounds);
        console.log("a: " + a);
        return (a);
    }

    async comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
        return (await bcrypt.compare(plainTextPassword, hashedPassword));
    }

}
