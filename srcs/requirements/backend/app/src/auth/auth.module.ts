import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Profile } from "../modules/profiles/entities/Profile.entity";
import { User } from "../modules/users/entities/User.entity";
import { jwtConstants } from "./constant";
import { UsersModule } from "../modules/users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { JwtTwoFactorStrategy } from "./jwt-two-factor.strategy";
import { JwtRefreshStrategy } from "./jwt-refresh.strategy";

@Module({
	imports: [
		JwtModule.register({
			global:true,
			secret:jwtConstants.secret,
			signOptions : {expiresIn: '7200s'}
  		}), 
		TypeOrmModule.forFeature([User, Profile]),
		forwardRef(() => UsersModule),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, JwtTwoFactorStrategy, JwtRefreshStrategy],
	exports: [AuthService],
})
export class AuthModule {}
