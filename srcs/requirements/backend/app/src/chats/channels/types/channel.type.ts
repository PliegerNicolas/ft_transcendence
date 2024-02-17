import { ChannelStatus } from "../entities/Channel.entity";

export type CreateChannelParams = {

    name: string;
    status: ChannelStatus;

};

export type ReplaceChannelParams = {

    name: string;
    status: ChannelStatus;

};

export type UpdateChannelParams = {

    name?: string;
    status?: ChannelStatus;

};