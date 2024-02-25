import { UserResultWithUsername } from "../dtos/UserResult.dto";
import { GameType } from "../entities/Gamelog.entity";

export type CreateGamelogParams = {

    userResults: UserResultWithUsername[];
    gameType: GameType;

};

export type ReplaceGamelogParams = {

    userResults: UserResultWithUsername[];
    gameType: GameType;

};

export type UpdateGamelogParams = {

    userResults: UserResultWithUsername[];
    gameType?: GameType;

};