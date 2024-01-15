import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { UpdateProfileDto } from "src/profiles/dtos/UpdateProfile.dto";

export class UpdateUserDto {

    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ValidateNested()
    @Type(() => UpdateProfileDto)
    @IsOptional()
    profile: UpdateProfileDto;

}