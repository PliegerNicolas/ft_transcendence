import { RelationshipStatus } from "../entities/Relationship.entity";

export type CreateRelationshipParams = {
    targetId: bigint;
    status?: RelationshipStatus;
}

export type ReplaceRelationshipParams = {
    status: RelationshipStatus;
}

export type UpdateRelationshipParams = {
    status?: RelationshipStatus;
}