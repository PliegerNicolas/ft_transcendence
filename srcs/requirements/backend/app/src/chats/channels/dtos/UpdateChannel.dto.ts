import { IsEnum, IsOptional } from "class-validator";
import { ChannelStatus } from "../entities/Channel.entity";

export class UpdateChannelDto {

    @IsOptional()
    name?: string;

    @IsOptional()
    @IsEnum(ChannelStatus, { message: 'Invalid channel status' })
    status?: ChannelStatus;

}