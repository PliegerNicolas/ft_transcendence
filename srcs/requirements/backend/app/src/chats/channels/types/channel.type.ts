import { ChannelMode, ChannelVisibility } from "../entities/Channel.entity";

export class GetChannelsQueryParam {

    name?: string;
    visibility?: ChannelVisibility;
    mode?: ChannelMode;

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