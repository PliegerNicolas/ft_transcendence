import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, Validate, ValidateIf } from "class-validator";
import { ChannelAccessAction } from "../enums/channel-access-action.enum";
import { IsChannelMuteAction } from "src/common/validators/is-channel-mute-action.validator";

export class ChannelAccessDto {

    @IsNotEmpty()
    @IsEnum(ChannelAccessAction)
    action: ChannelAccessAction;

    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    @MaxLength(25, { each: true })
    @ArrayMinSize(1)
    usernames: string[];

    @IsChannelMuteAction()
    muteDuration?: number; // in seconds

}