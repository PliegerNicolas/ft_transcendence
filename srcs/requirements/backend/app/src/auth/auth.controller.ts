import { Controller, HttpCode, HttpStatus, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService){}
	
	@HttpCode(HttpStatus.OK)
	@Post('login')

	signIn(@Body() signInDto: Record<string, any>) {
		return this.authService.signIn(signInDto.oauthToken);
	  }

}
