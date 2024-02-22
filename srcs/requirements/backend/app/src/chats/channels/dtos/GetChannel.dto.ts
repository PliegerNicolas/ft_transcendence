import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Transform } from "class-transformer";
import { ChannelMode, ChannelVisibility } from "../entities/Channel.entity";

export class GetChannelDto {

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? null: (value ? value.trim() : null))
    @MinLength(8)
    password?: string;

}