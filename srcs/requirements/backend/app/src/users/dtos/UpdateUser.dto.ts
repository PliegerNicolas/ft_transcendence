import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { UpdateProfileDto } from "src/profiles/dtos/UpdateProfile.dto";

export class UpdateUserDto {

    @IsEmail()
    @IsOptional()
    email: string;

    @IsOptional()
    username: string;

    @IsOptional()
    password: string;

    @ValidateNested()
    @Type(() => UpdateProfileDto)
    @IsOptional()
    profile: UpdateProfileDto;

}