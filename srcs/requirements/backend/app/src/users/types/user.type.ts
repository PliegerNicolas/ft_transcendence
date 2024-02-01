// Assuming the data has already been validated.

import { CreateProfileDto } from "src/profiles/dtos/CreateProfile.dto";
import { ReplaceProfileDto } from "src/profiles/dtos/ReplaceProfile.dto";
import { UpdateProfileDto } from "src/profiles/dtos/UpdateProfile.dto";

export type CreateUserParams = {
    username: string;
    email: string;
    profile: CreateProfileDto;
};

export type ReplaceUserParams = {
    username: string;
    email: string;
    profile: ReplaceProfileDto;
};

export type UpdateUserParams = {
    username?: string;
    email?: string;
    profile?: UpdateProfileDto;
};