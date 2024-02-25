import { ValueTransformer } from "typeorm";

export enum ChannelRole {
    OWNER = 'owner',
    OPERATOR = 'operator',
    MEMBER = 'member',
}

const ChannelRoleOrder: Record<ChannelRole, number> = {
    [ChannelRole.OWNER]: 2,
    [ChannelRole.OPERATOR]: 1,
    [ChannelRole.MEMBER]: 0,
};

export function compareChannelRoles(role1: ChannelRole, role2: ChannelRole): number {
    return (ChannelRoleOrder[role1] - ChannelRoleOrder[role2]);
}