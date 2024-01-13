import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";
import { CreateProfileDto } from "src/profiles/dtos/CreateProfileDto";

export class CreateUserDto {

    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @Type(() => CreateProfileDto)
    profile: CreateProfileDto;
}