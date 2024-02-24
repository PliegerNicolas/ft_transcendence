import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";

export enum ChannelAccessAction {
    KICK = 'kick',
    BAN = 'ban',
    DEBAN = 'deban',
    INVITE = 'invite',
    UNINVITE = 'uninvite',
    MUTE = 'mute',
    UNMUTE = 'unmute',
}

export class ChannelAccessDto {

    @IsNotEmpty()
    @IsEnum(ChannelAccessAction)
    action: ChannelAccessAction;

    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    usernames: string[];

}