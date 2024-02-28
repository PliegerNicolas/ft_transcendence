import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { jwtConstants } from 'src/authorization-and-authentification/auth/constant';
  import { Request } from 'express';
import { AuthService } from 'src/authorization-and-authentification/auth/auth.service';
  
  @Injectable()
  export class JwtPublicGuard implements CanActivate {
	constructor(private jwtService: JwtService, private authService: AuthService) {}
  
	async canActivate(context: ExecutionContext): Promise<boolean> {
	  const request = context.switchToHttp().getRequest();
	  const token = request.headers.authorization;
	  if (!token) {
		return (true);
	  }
	  try {
		const payload = await this.jwtService.verifyAsync(
		  token,
		  {
			secret: jwtConstants.secret
		  }
		);
		// 💡 We're assigning the payload to the request object here
		// so that we can access it in our route handlers
		const users = (await this.authService.checkUser(payload.oauth_id)).users
		if (users == null)
		{
			throw new UnauthorizedException();
		}
		if (users.id != payload.user_id)
		{
			throw new UnauthorizedException();
		}
		request['user'] = {id: payload.user_id, oauth_id: payload.oauth_id, username: users.username};
	  } catch {
		throw new UnauthorizedException();
	  }
	  return true;
	}
  
	// private extractTokenFromHeader(request: Request): string | undefined {
	//   const [type, token] = request.headers.authorization?.split(' ') ?? [];
	//   return type === 'Bearer' ? token : undefined;
	// }
  }