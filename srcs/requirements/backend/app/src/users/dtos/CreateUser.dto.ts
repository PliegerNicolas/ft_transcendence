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
    oauthId: number;

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateProfileDto)
    profile: CreateProfileDto;

}