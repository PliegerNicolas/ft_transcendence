import { IsEnum, IsOptional, IsString } from "class-validator";
import { ChannelVisibility } from "../enums/channel-visibility.enum";
import { ChannelMode } from "../enums/channel-mode.enum";

export class GetChannelsQueryDto {

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEnum(ChannelVisibility)
    visibility?: ChannelVisibility;

    @IsOptional()
    @IsEnum(ChannelMode)
    mode?: ChannelMode;

}