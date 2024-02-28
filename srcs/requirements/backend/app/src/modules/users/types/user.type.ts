import { CreateProfileDto } from "../../profiles/dtos/CreateProfile.dto";
import { ReplaceProfileDto } from "../../profiles/dtos/ReplaceProfile.dto";
import { UpdateProfileDto } from "../../profiles/dtos/UpdateProfile.dto";

export type CreateUserParams = {
    username: string;
    email: string;
    oauthId: bigint;
    profile: CreateProfileDto;
};

export type ReplaceUserParams = {
    username: string;
    email: string;
    oauthId: bigint;
    profile: ReplaceProfileDto;
};

export type UpdateUserParams = {
    username?: string;
    email?: string;
    oauthId?: bigint;
    profile?: UpdateProfileDto;
};