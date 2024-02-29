import { Controller, HttpCode, HttpStatus, Post, Body, UseGuards, Head, Header, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService){}
	
	@HttpCode(HttpStatus.OK)
	@Post()
	signIn(@Body() oauthToken:JSON) {
		console.log("controller")
		return this.authService.signIn(oauthToken);
	  }

	@UseGuards(AuthGuard('jwt'))
	@Post('logout')
	addBlacklist(@Request() req){
		return this.authService.blacklist("add", req.headers.authorization)
	}

}
