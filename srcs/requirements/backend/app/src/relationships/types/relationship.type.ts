import { RelationshipStatus } from "../entities/Relationship.entity";

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