import { IsEnum, IsNotEmpty, Validate } from "class-validator";
import { GameResult } from "../entities/UserToGamelog";
import { ArraySizeMatchValidator } from "../validators/ArraySizeMatchValidator";

export class ReplaceGamelogDto {

    @IsNotEmpty()
    @Validate(ArraySizeMatchValidator, ['results'])
    userIds: number[];

    @IsNotEmpty()
    @IsEnum(GameResult, { each: true, message: 'Invalid game result' })
    results: GameResult[];

}