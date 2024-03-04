import { RelationshipStatus } from "../enums/relationship-status.enum";

export type CreateRelationshipParams = {
    username: string;
    status?: RelationshipStatus;
}

export type ReplaceRelationshipParams = {
    status: RelationshipStatus;
}

export type UpdateRelationshipParams = {
    status?: RelationshipStatus;
}