import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { ChannelMode, ChannelVisibility } from "../entities/Channel.entity";
import { IsValidChannelPasswordWithMode } from "src/common/validators/is-valid-channel-password-with-mode";

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

    @Transform(({ value }) => value?.length > 0 ? value.trim() : null)
    @IsValidChannelPasswordWithMode()
    password?: string;

}