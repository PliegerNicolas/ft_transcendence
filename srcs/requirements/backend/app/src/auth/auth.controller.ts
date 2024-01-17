import { Controller, HttpCode, HttpStatus, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService){}
	
	@HttpCode(HttpStatus.OK)
	// @Post('login')
	@Post()

	signIn(@Body() oauthToken:JSON) {
		return this.authService.signIn(oauthToken);
	  }

	//   signIn(@Body() signInDto: Record<string, any>) {
	// 	return this.authService.signIn(signInDto.username, signInDto.password);
	//   }

}
