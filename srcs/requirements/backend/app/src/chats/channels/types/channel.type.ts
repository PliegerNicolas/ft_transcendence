import { ChannelStatus } from "../entities/Channel.entity";

export type CreateChannelParams = {

    name: string;
    status: ChannelStatus;
    password?: string;

};

export type ReplaceChannelParams = {

    name: string;
    status: ChannelStatus;
    password: string;
    
};

export type UpdateChannelParams = {

    name?: string;
    status?: ChannelStatus;
    password?: string;

};

export type JoinChannelParams = {

    password?: string;

};

export type LeaveChannelParams = {

};