import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constant';
import { TypeORMError } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/User';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { Oauth42Strategy } from './local.strategy';

@Module({

  imports: [JwtModule.register({
	global:true,
	secret:jwtConstants.secret
  }), 
  TypeOrmModule.forFeature([User]),
	UsersModule, PassportModule],
  controllers: [],
  providers: [AuthService, Oauth42Strategy]
})
export class AuthModule {}
