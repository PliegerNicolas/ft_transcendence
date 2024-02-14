import { IsEnum, IsNotEmpty } from "class-validator";
import { ChannelStatus } from "../entities/Channel.entity";

export class ReplaceChannelDto {

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsEnum(ChannelStatus, { message: 'Invalid channel status' })
    status: ChannelStatus;

}