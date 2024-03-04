import { Type } from "class-transformer";
import { IsEmail, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { UpdateProfileDto } from "src/modules/profiles/dtos/UpdateProfile.dto";

export class UpdateUserDto {

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(25)
    username?: string;

    @IsOptional()
    oauthId?: bigint;

    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateProfileDto)
    profile?: UpdateProfileDto;

}