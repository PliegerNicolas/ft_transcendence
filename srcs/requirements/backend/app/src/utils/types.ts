// Assuming the data has already been validated.

import { CreateProfileDto } from "src/profiles/dtos/CreateProfileDto";

/* User */

export type CreateUserParams = {
    username: string;
    email: string;
    profile: CreateProfileDto;
};

export type UpdateUserParams = {
    username?: string;
    email?: string;
    profile?: CreateProfileDto;
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