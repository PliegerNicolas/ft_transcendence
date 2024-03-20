import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString, MaxLength, Validate } from "class-validator";
import { ChannelAccessAction } from "../enums/channel-access-action.enum";

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

}