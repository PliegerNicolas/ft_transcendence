import { RelationshipStatus } from "../entities/Relationship.entity";

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