import { ClassSerializerInterceptor, Controller, HttpCode, Post, Request, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TwoFactorAuthService } from './twofactorauth.service';
import { Response } from 'express';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwofactorauthController {
	constructor (private readonly twoFactorAuthService: TwoFactorAuthService){}

	@Post('generate')
	@HttpCode(200)
	@UseGuards(AuthGuard('jwt'))
	async register(
		@Request() req : any,
		@Res() res : Response
	){
		const { otpauthUrl } = await this.twoFactorAuthService.generateTwoFactorAuthSecret(req.user.oauth_id);

		return this.twoFactorAuthService.pipeQrCodeSteam(res, otpauthUrl)
	}

}
