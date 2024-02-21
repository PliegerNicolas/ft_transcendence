import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { ChannelStatus } from "../entities/Channel.entity";
import { Transform } from "class-transformer";

export class CreateChannelDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEnum(ChannelStatus, { message: 'Invalid channel status' })
    status: ChannelStatus;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? null: (value ? value.trim() : null))
    @MinLength(8)
    password: string;

}