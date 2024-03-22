import { IsEnum, IsNotEmpty } from "class-validator";
import { RelationshipStatus } from "../enums/relationship-status.enum";

export class ReplaceRelationshipDto {

    @IsEnum(RelationshipStatus, { message: 'Invalid relationship status' })
    @IsNotEmpty()
    status: RelationshipStatus;

}