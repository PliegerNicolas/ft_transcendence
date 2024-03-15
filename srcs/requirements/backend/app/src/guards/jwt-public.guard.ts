import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { jwtConstants } from 'src/auth/constant';
  import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
  
  @Injectable()
  export class JwtPublicGuard implements CanActivate {
	constructor(private jwtService: JwtService, private authService: AuthService) {}
  
	async canActivate(context: ExecutionContext): Promise<boolean> {
	  const request = context.switchToHttp().getRequest();
	  const token = request.cookies['access_token'];
	  if (!token) {
		return (true);
	  }
	  try {
		if (await this.authService.blacklist("check", token) === false) throw new UnauthorizedException();

		const payload = await this.jwtService.verifyAsync(
		  token,
		  {
			secret: jwtConstants.secret,
			ignoreExpiration: false
		  }
		);
		const user = await this.authService.checkUser(payload.oauth_id);
		if (!user) throw new UnauthorizedException();
		if (user.id != payload.user_id)
		{
			throw new UnauthorizedException();
		}
		request['user'] = {id: payload.user_id, oauth_id: payload.oauth_id, username: user.username};
	  } catch {
		throw new UnauthorizedException();
	  }
	  return true;
	}
  }