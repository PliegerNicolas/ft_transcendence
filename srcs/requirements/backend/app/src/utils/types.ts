// Assuming the data has already been validated.

import { FriendshipStatus } from "src/friendships/entities/Friendships";
import { CreateProfileDto } from "src/profiles/dtos/CreateProfile.dto";
import { UpdateProfileDto } from "src/profiles/dtos/UpdateProfile.dto";

/* User */

export type CreateUserParams = {
    username: string;
    email: string;
    profile: CreateProfileDto;
};

export type ReplaceUserParams = {
    username: string;
    email: string;
    profile: UpdateProfileDto;
};

export type UpdateUserParams = {
    username?: string;
    email?: string;
    profile?: UpdateProfileDto;
};

/* Profile */

export type CreateProfileParams = {
    firstName: string;
    lastName: string;
}

export type ReplaceProfileParams = {
    firstName: string;
    lastName: string;
}

export type UpdateProfileParams = {
    firstName?: string;
    lastName?: string;
}

/* Friendship */

export type CreateFriendshipParams = {
    targetId: number;
}

export type ReplaceFriendshipParams = {
    status: FriendshipStatus;
}

export type UpdateFriendshipParams = {
    status?: FriendshipStatus;
}

export type Message = {
	username: string;
	message: string;
}