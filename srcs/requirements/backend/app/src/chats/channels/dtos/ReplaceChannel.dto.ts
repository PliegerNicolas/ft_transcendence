import { IsDefined, IsEnum, IsNotEmpty, IsString, MinLength, ValidateIf } from "class-validator";
import { ChannelStatus } from "../entities/Channel.entity";
import { Transform } from "class-transformer";

export class ReplaceChannelDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEnum(ChannelStatus, { message: 'Invalid channel status' })
    status: ChannelStatus;

    @IsDefined()
    @IsString()
    @Transform(({ value }) => value === '' ? null: (value ? value.trim() : null))
    @ValidateIf((o) => o.password !== null)
    @MinLength(8)
    password: string;

}