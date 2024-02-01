import { IsEnum, IsOptional } from "class-validator";
import { RelationshipStatus } from "../entities/Relationship.entity";

export class UpdateRelationshipDto {

    @IsEnum(RelationshipStatus, { message: 'Invalid relationship status' })
    @IsOptional()
    status: RelationshipStatus;

}