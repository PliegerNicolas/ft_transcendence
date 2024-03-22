import { Type } from "class-transformer";
import { IsDefined, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { ReplaceProfileDto } from "src/modules/profiles/dtos/ReplaceProfile.dto";

export class ReplaceUserDto {

    @IsEmail()
    @IsDefined()
    @IsNotEmpty()
    email: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @MaxLength(25)
    username: string;

    @IsDefined()
    @IsNotEmpty()
    oauthId: bigint;

    @IsOptional()
    @ValidateNested()
    @Type(() => ReplaceProfileDto)
    profile: ReplaceProfileDto;

}