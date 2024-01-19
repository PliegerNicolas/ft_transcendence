import { RelationshipStatus } from "../entities/Relationship";

export type CreateRelationshipParams = {
    targetId: number;
    status?: RelationshipStatus;
}

export type ReplaceRelationshipParams = {
    status: RelationshipStatus;
}

export type UpdateRelationshipParams = {
    status?: RelationshipStatus;
}