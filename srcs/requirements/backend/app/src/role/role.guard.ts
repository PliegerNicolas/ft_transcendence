import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UsingJoinTableOnlyOnOneSideAllowedError } from 'typeorm';

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private reflector: Reflector, private jwtService : JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // return true;
  	const request = context.switchToHttp().getRequest();
	const token = this.jwtService.decode(request.headers.authorization);
	const user = request.params;
	// console.log(user.channelId)
	// console.log(token.user_id)

	return true;
  }

}
