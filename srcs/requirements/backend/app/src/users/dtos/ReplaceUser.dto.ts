import { Type } from "class-transformer";
import { IsDefined, IsEmail, IsNotEmpty, ValidateNested } from "class-validator";
import { ReplaceProfileDto } from "src/profiles/dtos/ReplaceProfile.dto";

export class ReplaceUserDto {

    @IsDefined()
    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsDefined()
    @IsNotEmpty()
    email: string;

    @ValidateNested()
    @Type(() => ReplaceProfileDto)
    @IsDefined()
    profile: ReplaceProfileDto;

}