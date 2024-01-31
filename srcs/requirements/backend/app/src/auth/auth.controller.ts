import { Controller, HttpCode, HttpStatus, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService){}
	
	// @UseGuards(AuthGuard('local'))
	@HttpCode(HttpStatus.OK)
	@Post()

	signIn(@Body() oauthToken:JSON) {
		console.log("controller")
		return this.authService.signIn(oauthToken);
	  }


}
