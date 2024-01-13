// Assuming the data has already been validated.

import { CreateProfileDto } from "src/profiles/dtos/CreateProfileDto";
import { UpdateProfileDto } from "src/profiles/dtos/UpdateProfileDto";

/* User */

export type CreateUserParams = {
    username: string;
    email: string;
    profile: CreateProfileDto;
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

export type UpdateProfileParams = {
    firstName?: string;
    lastName?: string;
}