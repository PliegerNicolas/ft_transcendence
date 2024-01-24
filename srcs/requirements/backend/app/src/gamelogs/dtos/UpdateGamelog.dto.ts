import { IsEnum, Validate } from "class-validator";
import { GameResult } from "../entities/UserToGamelog";
import { ArraySizeMatchValidator } from "../validators/ArraySizeMatchValidator";

export class UpdateGamelogDto {

    @Validate(ArraySizeMatchValidator, ['results'])
    userIds?: number[];

    @IsEnum(GameResult, { each: true, message: 'Invalid game result' })
    results?: GameResult[];

}