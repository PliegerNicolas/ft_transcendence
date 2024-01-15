import { IsInt, IsNotEmpty } from "class-validator";
import { FriendshipStatus } from "../entities/Friendships";

export class UpdateFriendshipDto {

    status?: FriendshipStatus;

}