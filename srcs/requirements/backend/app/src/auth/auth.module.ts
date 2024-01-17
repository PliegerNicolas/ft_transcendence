import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constant';

@Module({

  imports: [JwtModule.register({
	global:true,
	secret:jwtConstants.secret
  })],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
