// Assuming the data has already been validated.

export type CreateProfileParams = {
    firstName: string;
    lastName: string;
}

export type ReplaceProfileParams = {
    firstName: string;
    lastName: string;
    elo?: number;
}

export type UpdateProfileParams = {
    firstName?: string;
    lastName?: string;
    elo?: number;
}