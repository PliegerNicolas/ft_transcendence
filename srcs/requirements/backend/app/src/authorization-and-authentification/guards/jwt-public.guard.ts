import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "../authentification/constants/jwt.constants";
import { AuthentificationService } from "../authentification/services/authentification/authentification.service";

@Injectable()
export class JwtPublicGuard implements CanActivate {

	constructor(
		private readonly jwtService: JwtService,
		private readonly authentificationService: AuthentificationService
	) {}

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
				},
			);
		// 💡 We're assigning the payload to the request object here
		// so that we can access it in our route handlers
			const user = (await this.authentificationService.checkUser(payload.oauth_id)).user
			if (!user) throw new UnauthorizedException();
			if (user.id !== BigInt(payload.user_id)) throw new UnauthorizedException();

			request['user'] = {id: user.id, oauth_id: user.oauthId, username: user.username};
		} catch {
			throw new UnauthorizedException();
		}
		return (true);
	}

// private extractTokenFromHeader(request: Request): string | undefined {
//   const [type, token] = request.headers.authorization?.split(' ') ?? [];
//   return type === 'Bearer' ? token : undefined;
// }

}