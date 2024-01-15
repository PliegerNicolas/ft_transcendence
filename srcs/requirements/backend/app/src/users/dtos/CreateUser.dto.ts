import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { CreateProfileDto } from "src/profiles/dtos/CreateProfile.dto";

export class CreateUserDto {

    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ValidateNested()
    @Type(() => CreateProfileDto)
    @IsOptional()
    profile: CreateProfileDto;

}