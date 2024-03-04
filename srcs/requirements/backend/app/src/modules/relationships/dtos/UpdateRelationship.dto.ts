import { IsEnum, IsOptional } from "class-validator";
import { RelationshipStatus } from "../enums/relationship-status.enum";

export class UpdateRelationshipDto {

    @IsEnum(RelationshipStatus, { message: 'Invalid relationship status' })
    @IsOptional()
    status: RelationshipStatus;

}