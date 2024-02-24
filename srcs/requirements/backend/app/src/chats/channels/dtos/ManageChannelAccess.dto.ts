import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, MinLength } from "class-validator";

export enum ManageChannelAccessAction {
    KICK = 'kick',
    BAN = 'ban',
    DEBAN = 'deban',
    INVITE = 'invite',
    UNINVITE = 'uninvite',
    MUTE = 'mute',
    UNMUTE = 'unmute',
}

export class ManageChannelMembersDto {

    @IsNotEmpty()
    @IsEnum(ManageChannelAccessAction)
    action: ManageChannelAccessAction;

    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    userIds: bigint[];

}