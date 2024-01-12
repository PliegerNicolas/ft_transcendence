// Assuming the data has already been validated.

/* User */

export type CreateUserParams = {
    username: string;
    email: string;
};

export type UpdateUserParams = {
    username: string;
    email: string;
};

/* Profile */

export type CreateProfileParams = {
    firstName: string;
    lastName: string;
}

export type UpdateProfileParams = {
    firstName: string;
    lastName: string;
}