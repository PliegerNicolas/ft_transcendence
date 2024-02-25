import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('me')
export class MeController {

	@UseGuards(AuthGuard('jwt'))
    @Get('user')
    async getUsername(@Request() req: any) {
        return (await req.user ? req.user : null);
    }
}
