import { IsEnum, IsNotEmpty } from "class-validator";
import { FriendshipStatus } from "../entities/Friendships";

export class ReplaceFriendshipDto {

    @IsEnum(FriendshipStatus, { message: 'Invalid friendship status' })
    @IsNotEmpty()
    status: FriendshipStatus;

}