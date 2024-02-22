import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Transform } from "class-transformer";
import { ChannelMode, ChannelVisibility } from "../entities/Channel.entity";

export class CreateChannelDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEnum(ChannelVisibility, { message: 'Invalid channel visibility' })
    visibility: ChannelVisibility;

    @IsNotEmpty()
    @IsEnum(ChannelMode, { message: 'Invalid channel mode' })
    mode: ChannelMode;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? null: (value ? value.trim() : null))
    @MinLength(8)
    password: string;

}