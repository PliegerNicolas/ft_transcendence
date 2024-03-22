import { User } from "src/modules/users/entities/User.entity";
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

/* Helpers */

export type UserStatus = {
    user: User;
    status: RelationshipStatus;
}