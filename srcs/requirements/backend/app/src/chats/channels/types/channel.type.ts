import { ChannelAccessAction } from "../enums/channel-access-action.enum";
import { ChannelMode } from "../enums/channel-mode.enum";
import { ChannelVisibility } from "../enums/channel-visibility.enum";

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

}