import { IsEnum, IsOptional, IsString } from "class-validator";
import { ChannelMode, ChannelVisibility } from "../entities/Channel.entity";
import { Transform } from "class-transformer";
import { IsValidChannelPasswordWithMode } from "src/common/validators/is-valid-channel-password-with-mode";

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

    @Transform(({ value }) => value?.length > 0 ? value.trim() : null)
    @IsValidChannelPasswordWithMode()
    password?: string;

}