import { Module, forwardRef } from '@nestjs/common';
import { TwoFactorAuthService } from './twofactorauth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/User.entity';
import { UsersModule } from '../modules/users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(() => UsersModule),
    ],
    controllers: [],
    providers: [TwoFactorAuthService],
    exports: [TwoFactorAuthService],
})
export class TwofactorauthModule {}
