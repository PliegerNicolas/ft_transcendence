import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { RelationshipStatus } from "../enums/relationship-status.enum";

export class CreateRelationshipDto {

    @IsNotEmpty()
    @IsString()
    @MaxLength(25)
    username: string;

    @IsEnum(RelationshipStatus, { message: 'Invalid relationship status' })
    @IsIn([RelationshipStatus.ACCEPTED, RelationshipStatus.BLOCKED], { message: 'Status must be either "accepted" or "blocked" on creation' })
    @IsOptional()
    status?: RelationshipStatus;

}