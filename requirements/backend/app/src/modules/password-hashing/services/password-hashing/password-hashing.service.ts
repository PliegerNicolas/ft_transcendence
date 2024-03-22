import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordHashingService {

    private readonly settings: argon2.Options;

    constructor() {
        this.settings = {};
    }

    async hashPassword(password: string): Promise<string> {
        if (!password) throw new Error(`A password should be provided`);
        return (await argon2.hash(password, this.settings));
    }

    async comparePasswords(hashedPassword: string, plainTextPassword: string): Promise<boolean> {
        if (!plainTextPassword || !hashedPassword) throw new Error(`A plainTextPassword and a hashedPassword should be provided`);
        return (await argon2.verify(hashedPassword, plainTextPassword))
    }
    
}
