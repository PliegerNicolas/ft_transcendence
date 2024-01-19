import { Controller, HttpCode, HttpStatus, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService){}
	
	@HttpCode(HttpStatus.OK)
	@Post()

	signIn(@Body() oauthToken:JSON) {
		return this.authService.signIn(oauthToken);
	  }


}
