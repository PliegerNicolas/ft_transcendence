import { UserResult } from "../dtos/UserResult.dto";
import { GameType } from "../entities/Gamelog.entity";

export type CreateGamelogParams = {

    userResults: UserResult[];
    gameType: GameType;

};

export type ReplaceGamelogParams = {

    userResults: UserResult[];
    gameType: GameType;

};

export type UpdateGamelogParams = {

    userResults?: UserResult[];
    gameType?: GameType;

};