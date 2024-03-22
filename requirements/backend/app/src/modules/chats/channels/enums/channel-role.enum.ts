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

export function promoteChannelRole(role: ChannelRole): ChannelRole {
    const nextRoleIndex = ChannelRoleOrder[role] + 1;
    const nextRole = Object.keys(ChannelRoleOrder).find((key) => ChannelRoleOrder[key as ChannelRole] === nextRoleIndex) as ChannelRole | undefined;
    return (nextRole || role);
}

export function demoteChannelRole(role: ChannelRole): ChannelRole {
    const nextRoleIndex = ChannelRoleOrder[role] - 1;
    const nextRole = Object.keys(ChannelRoleOrder).find((key) => ChannelRoleOrder[key as ChannelRole] === nextRoleIndex) as ChannelRole | undefined;
    return (nextRole || role);
}