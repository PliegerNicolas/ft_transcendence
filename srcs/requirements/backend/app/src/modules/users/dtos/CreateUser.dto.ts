import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { CreateProfileDto } from "src/modules/profiles/dtos/CreateProfile.dto";

export class CreateUserDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(25)
    username: string;

    @IsNotEmpty()
    oauthId: bigint;

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateProfileDto)
    profile: CreateProfileDto = new CreateProfileDto();

}