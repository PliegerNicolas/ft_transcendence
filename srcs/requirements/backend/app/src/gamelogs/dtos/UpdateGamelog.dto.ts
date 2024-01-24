import { IsArray, IsEnum, IsOptional, ValidateIf } from "class-validator";
import { GameResult } from "../entities/UserToGamelog";
import { ArraySizeMatch } from "../validators/ArraySizeMatch.validator";
import { BothFieldsAreSet } from "../validators/BothFieldsAreSet.validator";
import { GameType } from "../entities/Gamelog";

export class UpdateGamelogDto {

    @IsOptional()
    @BothFieldsAreSet('results', { message: 'userIds and results should either be defined or not' })
    @ArraySizeMatch('results', { message: 'userIds and results should be the same size' })
    @IsArray()
    userIds: number[];

    @IsOptional()
    @IsArray()
    @IsEnum(GameResult, { each: true, message: 'Invalid game result' })
    results: GameResult[];

    @IsOptional()
    @IsEnum(GameType, { message: 'Invalid game type' })
    gameType: GameType;

}