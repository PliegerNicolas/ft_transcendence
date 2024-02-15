import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseUsernamePipe implements PipeTransform {

	transform(value: string, metadata: ArgumentMetadata): string {
		this.isValidUsername(value);
    	return (value);
	}

	private isValidUsername(username: string): void {
		if (!username) throw new BadRequestException('Username cannot be empty');
		else if (username.length < 1 || username.length > 25) throw new BadRequestException('Username should have from 1 to 25 characters');

		// needs more checks probably
	}
}
