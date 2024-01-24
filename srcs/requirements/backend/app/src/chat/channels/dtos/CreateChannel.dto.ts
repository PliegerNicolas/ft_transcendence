import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateChannelDto {

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsNotEmpty()
	type: 'public' | 'private' | 'password';

	@IsString()
	@IsNotEmpty()
	owner_id: string;

	@IsString()
	@IsOptional()
	password?: string;
}