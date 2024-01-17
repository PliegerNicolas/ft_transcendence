import { IsInt, IsNotEmpty } from "class-validator";

export class CreateRelationshipDto {

    @IsInt()
    @IsNotEmpty()
    targetId: number;

}