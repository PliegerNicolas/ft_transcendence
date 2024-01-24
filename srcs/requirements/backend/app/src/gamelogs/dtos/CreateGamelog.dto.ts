import { IsArray, IsEnum, IsNotEmpty, Validate } from "class-validator";
import { GameResult } from "../entities/UserToGamelog";
import { ArraySizeMatch } from "../validators/ArraySizeMatch.validator";
import { GameType } from "../entities/Gamelog";

export class CreateGamelogDto {

    @IsNotEmpty()
    @IsArray()
    @ArraySizeMatch('results', { message: 'userIds and results should be the same size' })
    userIds: number[];

    @IsNotEmpty()
    @IsArray()
    @IsEnum(GameResult, { each: true, message: 'Invalid game result' })
    results: GameResult[];

    @IsNotEmpty()
    @IsEnum(GameType, { message: 'Invalid game type' })
    gameType: GameType;

}