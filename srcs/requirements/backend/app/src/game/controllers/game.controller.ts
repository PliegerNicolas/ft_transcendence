import { Controller, Get, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('game')
export class GameController {

	@UseGuards(AuthGuard('jwt'))
    @Get('me')
    async getUsername(@Request() req: any) {
        return (await req.user ? req.user.id : new NotFoundException(`User not found`));
    }
}
