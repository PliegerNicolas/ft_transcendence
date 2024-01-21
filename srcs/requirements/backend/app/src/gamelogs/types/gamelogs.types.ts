import { GameResult } from "../entities/UserToGamelog";

export type CreateGamelogParams = {

    userIds: number[];
    results: GameResult[];

};

export type ReplaceGamelogParams = {

    userIds: number[];
    results: GameResult[];

};

export type UpdateGamelogParams = {

    userIds: number[];
    results: GameResult[];

};