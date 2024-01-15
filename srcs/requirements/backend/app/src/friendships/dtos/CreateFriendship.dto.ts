import { IsInt, IsNotEmpty } from "class-validator";

export class CreateFriendshipDto {

    @IsInt()
    @IsNotEmpty()
    targetId: number;

}