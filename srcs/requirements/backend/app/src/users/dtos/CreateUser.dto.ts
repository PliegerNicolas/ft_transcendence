import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { CreateProfileDto } from "src/profiles/dtos/CreateProfile.dto";

export class CreateUserDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;

    @ValidateNested()
    @Type(() => CreateProfileDto)
    @IsOptional()
    profile: CreateProfileDto;

}