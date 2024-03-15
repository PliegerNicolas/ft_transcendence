import { IsOptional } from "class-validator";

export class UpdateProfileDto {

    @IsOptional()
    firstName: string;

    @IsOptional()
    lastName: string;

    @IsOptional()
    elo: number;

}