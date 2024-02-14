import { IsEnum, IsIn, IsInt, IsNotEmpty, IsOptional } from "class-validator";
import { RelationshipStatus } from "../entities/Relationship.entity";

export class CreateRelationshipDto {

    @IsInt()
    @IsNotEmpty()
    targetId: bigint;

    @IsEnum(RelationshipStatus, { message: 'Invalid relationship status' })
    @IsIn([RelationshipStatus.ACCEPTED, RelationshipStatus.BLOCKED], { message: 'Status must be either "accepted" or "blocked" on creation' })
    @IsOptional()
    status?: RelationshipStatus;

}