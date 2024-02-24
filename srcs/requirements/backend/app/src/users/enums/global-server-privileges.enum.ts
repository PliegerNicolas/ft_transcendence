import { ValueTransformer } from "typeorm";

export enum GlobalServerPrivileges {
    OPERATOR = 1,
    USER = 0,
}

const GlobalServerPrivilegesOrder: Record<GlobalServerPrivileges, number> = {
    [GlobalServerPrivileges.OPERATOR]: 1,
    [GlobalServerPrivileges.USER]: 0,
};

export function compareGlobalServerPrivileges(globalServerPrivilege1: GlobalServerPrivileges, globalServerPrivilege2: GlobalServerPrivileges): number {
    return (GlobalServerPrivilegesOrder[globalServerPrivilege1] - GlobalServerPrivilegesOrder[globalServerPrivilege2]);
}