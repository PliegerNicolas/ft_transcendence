import { IsEmail, IsNotEmpty } from "class-validator";

export class UpdateUserDto {

    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}