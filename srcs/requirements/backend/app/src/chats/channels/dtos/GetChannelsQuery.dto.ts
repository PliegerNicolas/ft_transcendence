import { IsEnum, IsOptional, IsString } from "class-validator";
import { ChannelMode, ChannelVisibility } from "../entities/Channel.entity";

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