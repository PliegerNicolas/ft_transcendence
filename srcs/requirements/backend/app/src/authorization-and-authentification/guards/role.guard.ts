import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelMember } from "src/modules/chats/channels/entities/ChannelMember.entity";
import { Repository } from "typeorm";
import { GlobalRole, Role } from "./role.decorator";
import { User } from "../../modules/users/entities/User.entity";

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private jwtService : JwtService,
				@InjectRepository(ChannelMember)
				private channelMemberRepository : Repository<ChannelMember>,
				private reflector : Reflector) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
  	const request = context.switchToHttp().getRequest();
	const token = this.jwtService.decode(request.headers.authorization);
	const params = request.params;
	const roles = this.reflector.get(Role, context.getHandler());
	// console.log(user.channelId)
	// console.log(token.user_id)

	const member = await this.channelMemberRepository.findOne({
	relations : {
			channel : true,
			user : true
		},
		where : {
			channel : {
				id: params.channelId
			},
			user : {
				id : token.user_id
			}
		}

	}).then(
		(data) => data
	)
	if (member == null)
	{
		return (false);
	}
	// console.log(member.role)
	// console.log(roles);

	// /!\ THIS FAILS BECAUSE ROLE ARE NOW INTEGERS.
	
	if (roles.find((element) => element == String(member.role)) == undefined)
	{
		return false;
	}
	

	return true;
  }

}

@Injectable()
export class RoleGlobalGuard implements CanActivate {
	constructor(private jwtService : JwtService,
				@InjectRepository(User)
				private userRepository : Repository<User>,
				private reflector : Reflector) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
  	const request = context.switchToHttp().getRequest();
	const token = this.jwtService.decode(request.headers.authorization);
	const roles = this.reflector.get(GlobalRole, context.getHandler());
	// console.log(user.channelId)
	// console.log(token.user_id)

	const member = await this.userRepository.findOne({
		where : {
			id : token.user_id
		}

	}).then(
		(data) => data
	)
	if (member == null)
	{
		return (false);
	}
	// console.log(member.role)
	// console.log(roles)
	
	if (roles.find((element) => element == String(member.globalServerPrivileges)) == undefined)
	{
		return false;
	}
	

	return true;
  }

}