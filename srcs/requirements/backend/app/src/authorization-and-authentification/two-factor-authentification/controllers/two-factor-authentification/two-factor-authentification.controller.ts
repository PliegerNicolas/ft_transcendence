import { ClassSerializerInterceptor, Controller, Post, Request, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { TwoFactorAuthentificationService } from '../../services/two-factor-authentification/two-factor-authentification.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthentificationController {

    constructor(private readonly twoFactorAuthentificationService: TwoFactorAuthentificationService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post('generate')    async register(
        @Request() req: any,
		@Res() res: Response,
    ) {
		const { otpauthUrl } = await this.twoFactorAuthentificationService.generateTwoFactorAuthSecret(req.user);
		return (await this.twoFactorAuthentificationService.pipeQrCodeSteam(res, otpauthUrl));
    }

}