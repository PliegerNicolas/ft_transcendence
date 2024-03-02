import { Controller, HttpCode, HttpStatus, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ParseUsernamePipe } from 'src/common/pipes/parse-username/parse-username.pipe';

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

	@Post('log_as/:username')
	logAs(@Param('username', ParseUsernamePipe) username: string){
		return this.authService.log_as(username)
	}
}
