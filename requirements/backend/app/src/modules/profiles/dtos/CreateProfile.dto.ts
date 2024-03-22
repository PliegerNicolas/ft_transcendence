import { IsOptional } from "class-validator";

export class CreateProfileDto {

    @IsOptional()
    firstName: string;

    @IsOptional()
    lastName: string;

}