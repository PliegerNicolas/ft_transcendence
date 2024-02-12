import { Type } from "class-transformer";
import { IsDefined, IsEmail, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { ReplaceProfileDto } from "src/profiles/dtos/ReplaceProfile.dto";

export class ReplaceUserDto {

    @IsEmail()
    @IsDefined()
    @IsNotEmpty()
    email: string;

    @IsDefined()
    @IsNotEmpty()
    username: string;

    @IsDefined()
    @IsNotEmpty()
    oauthId: number;

    @IsOptional()
    @ValidateNested()
    @Type(() => ReplaceProfileDto)
    profile: ReplaceProfileDto;

}