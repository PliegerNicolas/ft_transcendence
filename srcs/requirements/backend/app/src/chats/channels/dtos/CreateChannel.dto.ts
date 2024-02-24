import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { IsValidChannelPasswordWithMode } from "src/common/validators/is-valid-channel-password-with-mode";
import { Transform } from "class-transformer";
import { ChannelVisibility } from "../enums/channel-visibility.enum";
import { ChannelMode } from "../enums/channel-mode.enum";

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

    @Transform(({ value }) => value?.length > 0 ? value.trim() : null)
    @IsValidChannelPasswordWithMode()
    password?: string;

}