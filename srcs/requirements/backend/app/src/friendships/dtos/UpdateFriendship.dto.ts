import { IsEnum, IsOptional } from "class-validator";
import { FriendshipStatus } from "../entities/Friendships";

export class UpdateFriendshipDto {

    @IsEnum(FriendshipStatus, { message: 'Invalid friendship status' })
    @IsOptional()
    status: FriendshipStatus;

}