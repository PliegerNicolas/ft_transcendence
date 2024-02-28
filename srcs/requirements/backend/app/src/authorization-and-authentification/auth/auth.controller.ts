import { Controller, HttpCode, HttpStatus, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService){}
	
	@HttpCode(HttpStatus.OK)
	@Post()

	signIn(@Body() oauthToken:JSON) {
		console.log("controller")
		return this.authService.signIn(oauthToken);
	  }


}
