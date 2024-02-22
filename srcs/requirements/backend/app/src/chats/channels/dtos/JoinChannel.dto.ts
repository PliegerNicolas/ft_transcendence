import { Transform } from "class-transformer";
import { IsOptional, IsString, MinLength } from "class-validator";

export class JoinChannelDto {

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? null: (value ? value.trim() : null))
    @MinLength(8)
    password?: string;

}