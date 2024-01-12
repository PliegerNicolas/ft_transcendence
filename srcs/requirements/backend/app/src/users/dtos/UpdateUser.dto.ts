import { IsEmail, IsNotEmpty } from "class-validator";
import { CreateProfileDto } from "src/profiles/dtos/CreateProfileDto";

export class UpdateUserDto {

    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    profile: CreateProfileDto;
}