import { ValueTransformer } from "typeorm";

export enum ChannelRole {
    OWNER = 2,
    OPERATOR = 1,
    MEMBER = 0,
}