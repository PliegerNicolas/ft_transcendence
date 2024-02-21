import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/services/users/users.service';

@Injectable()
export class TwoFactorAuthService {
	constructor(private usersService: UsersService){}


}
