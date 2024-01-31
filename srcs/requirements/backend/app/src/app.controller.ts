import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';


@Controller()
export class AppController {
	constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('auth')
  async login(@Body() req:JSON) {
	console.log('test')
    return this.authService.signIn(req)
  }
}
