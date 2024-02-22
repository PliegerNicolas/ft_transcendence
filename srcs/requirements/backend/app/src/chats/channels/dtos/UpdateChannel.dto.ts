import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { ChannelMode, ChannelVisibility } from "../entities/Channel.entity";
import { Transform } from "class-transformer";

export class UpdateChannelDto {

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEnum(ChannelVisibility, { message: 'Invalid channel visibility' })
    visibility?: ChannelVisibility;

    @IsOptional()
    @IsEnum(ChannelMode, { message: 'Invalid channel mode' })
    mode?: ChannelMode;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? null: (value ? value.trim() : null))
    @MinLength(8)
    password?: string;

}