import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constant';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/User.entity';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { Profile } from 'src/profiles/entities/Profile.entity';

@Module({

  imports: [JwtModule.register({
	global:true,
	secret:jwtConstants.secret,
	signOptions : {expiresIn: '7200s'}
  }), 
  TypeOrmModule.forFeature([User, Profile]),
	UsersModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
