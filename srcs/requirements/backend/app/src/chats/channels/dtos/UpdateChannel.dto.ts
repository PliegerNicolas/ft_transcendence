import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { ChannelStatus } from "../entities/Channel.entity";
import { Transform } from "class-transformer";
import { IsStrongPassword } from "src/common/validators/is-strong-password.validator";

export class UpdateChannelDto {

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEnum(ChannelStatus, { message: 'Invalid channel status' })
    status?: ChannelStatus;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? null: (value ? value.trim() : null))
    @MinLength(8)
    password?: string;

}