import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateProfileDto {

    firstName: string;

    lastName: string;
    
}