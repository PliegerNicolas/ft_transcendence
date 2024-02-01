import { Type } from "class-transformer";
import { IsDefined, IsEmail, IsNotEmpty, ValidateNested } from "class-validator";
import { ReplaceProfileDto } from "src/profiles/dtos/ReplaceProfile.dto";

export class ReplaceUserDto {

    @IsEmail()
    @IsDefined()
    @IsNotEmpty()
    email: string;

    @IsDefined()
    @IsNotEmpty()
    username: string;



    @ValidateNested()
    @Type(() => ReplaceProfileDto)
    @IsDefined()
    profile: ReplaceProfileDto;

}