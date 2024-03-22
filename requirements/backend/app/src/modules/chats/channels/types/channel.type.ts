import { User } from "src/modules/users/entities/User.entity";
import { ChannelMember } from "../entities/ChannelMember.entity";
import { ChannelAccessAction } from "../enums/channel-access-action.enum";
import { ChannelMode } from "../enums/channel-mode.enum";
import { ChannelVisibility } from "../enums/channel-visibility.enum";
import { Message } from "../../messages/entities/Message.entity";
import { ChannelRole } from "../enums/channel-role.enum";
import { Channel } from "../entities/Channel.entity";

export class GetChannelsQueryParam {

    name?: string;
    visibility?: ChannelVisibility;
    mode?: ChannelMode;

}

export type GetChannelParams = {

    password?: string;

}

export type CreateChannelParams = {

    name: string;
    visibility: ChannelVisibility;
    mode: ChannelMode;
    password?: string;

};

export type CreatePrivateChannelParams = {

    username: string;

}

export type ReplaceChannelParams = {

    name: string;
    visibility: ChannelVisibility;
    mode: ChannelMode;
    password?: string;
    
};

export type UpdateChannelParams = {

    name?: string;
    visibility?: ChannelVisibility;
    mode?: ChannelMode;
    password?: string;

};

export type JoinChannelParams = {

    password?: string;

}

export type LeaveChannelParams = {

    password?: string;

}

export type ChannelAccessParams = {

    action: ChannelAccessAction;
    usernames: string[];
    muteDuration?: number;

}

export type StrippedChannel = { // Has to be configured. All the fields are present for this moment.

    name: string;
    visibility: ChannelVisibility;
    mode: ChannelMode;

    membersCount: number;
    members: ChannelMember[],
    invitedUsers: User[],
    bannedUsers: User[],
    mutedUsers: User[],

    messages: Message[],

    createdAt: Date,
    updatedAt: Date,

}

export type ChannelWithSpecs = {

    channel: Channel,
    isMember: boolean;
    role: ChannelRole;

}