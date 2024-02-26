export enum GlobalServerPrivileges {
    OPERATOR = 'operator',
    USER = 'user',
}

const GlobalServerPrivilegesOrder: Record<GlobalServerPrivileges, number> = {
    [GlobalServerPrivileges.OPERATOR]: 1,
    [GlobalServerPrivileges.USER]: 0,
};

export function compareGlobalServerPrivileges(globalServerPrivilege1: GlobalServerPrivileges, globalServerPrivilege2: GlobalServerPrivileges): number {
    return (GlobalServerPrivilegesOrder[globalServerPrivilege1] - GlobalServerPrivilegesOrder[globalServerPrivilege2]);
}