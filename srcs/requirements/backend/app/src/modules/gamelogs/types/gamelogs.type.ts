import { UserResultWithUsername } from "../dtos/UserResult.dto";
import { GameType } from "../enums/game-type.enum";

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