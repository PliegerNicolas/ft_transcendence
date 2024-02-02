import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constant';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/User.entity';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { Oauth42Strategy } from './local.strategy';
import { Profile } from 'src/profiles/entities/Profile';

@Module({

  imports: [JwtModule.register({
	global:true,
	secret:jwtConstants.secret
  }), 
  TypeOrmModule.forFeature([User, Profile]),
	UsersModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
