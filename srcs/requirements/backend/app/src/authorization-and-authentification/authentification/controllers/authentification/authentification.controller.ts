import { Body, Controller, Post } from '@nestjs/common';
import { AuthentificationService } from '../../services/authentification/authentification.service';

@Controller('auth')
export class AuthentificationController {

	constructor(private authentificationService: AuthentificationService) {}
	
	@Post()
	async signIn(
        @Body() oauthToken: JSON,
    ) {
		console.log("controller");
		return (await this.authentificationService.signIn(oauthToken));
	}

}
