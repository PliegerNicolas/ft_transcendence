import { IsEnum, IsNotEmpty } from "class-validator";
import { RelationshipStatus } from "../entities/Relationship.entity";

export class ReplaceRelationshipDto {

    @IsEnum(RelationshipStatus, { message: 'Invalid relationship status' })
    @IsNotEmpty()
    status: RelationshipStatus;

}