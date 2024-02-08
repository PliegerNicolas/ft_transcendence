import { Controller, Get, UseGuards, Body, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';




@Controller()
export class AppController {
	constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('users/*')
  getProfile(@Request() req) {
    return req.user
  }
}
