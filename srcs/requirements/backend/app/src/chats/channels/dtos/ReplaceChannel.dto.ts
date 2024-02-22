import { IsDefined, IsEnum, IsNotEmpty, IsString, MinLength, ValidateIf } from "class-validator";
import { Transform } from "class-transformer";
import { ChannelMode, ChannelVisibility } from "../entities/Channel.entity";

export class ReplaceChannelDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEnum(ChannelVisibility, { message: 'Invalid channel visibility' })
    visibility: ChannelVisibility;

    @IsNotEmpty()
    @IsEnum(ChannelMode, { message: 'Invalid channel mode' })
    mode: ChannelMode;

    @IsDefined()
    @IsString()
    @Transform(({ value }) => value === '' ? null: (value ? value.trim() : null))
    @ValidateIf((o) => o.password !== null)
    @MinLength(8)
    password: string;

}