import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
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
    @Transform(({ value }) => value.trim())
    @MinLength(8)
    @IsStrongPassword()
    password?: string;

}