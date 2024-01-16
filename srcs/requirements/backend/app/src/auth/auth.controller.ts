import { Controller, HttpCode, HttpStatus, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService){}
	
	@HttpCode(HttpStatus.OK)
	@Post('login')
	@Get('auth')

	signIn(@Body() oauthToken:string) {
		return this.authService.signIn(oauthToken);
	  }

	//   signIn(@Body() signInDto: Record<string, any>) {
	// 	return this.authService.signIn(signInDto.username, signInDto.password);
	//   }

}
