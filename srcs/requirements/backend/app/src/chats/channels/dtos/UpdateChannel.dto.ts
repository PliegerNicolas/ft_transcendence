import { IsEnum, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { IsValidChannelPasswordWithMode } from "src/common/validators/is-valid-channel-password-with-mode";
import { ChannelVisibility } from "../enums/channel-visibility.enum";
import { ChannelMode } from "../enums/channel-mode.enum";

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