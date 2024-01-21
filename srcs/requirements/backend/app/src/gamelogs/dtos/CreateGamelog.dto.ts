import { IsEnum, IsNotEmpty, Validate } from "class-validator";
import { GameResult } from "../entities/UserToGamelog";
import { ArraySizeMatchValidator } from "../validators/ArraySizeMatchValidator";

export class CreateGamelogDto {

    @IsNotEmpty()
    userIds: number[];

    @IsNotEmpty()
    @IsEnum(GameResult, { each: true, message: 'Invalid game result' })
    @Validate(ArraySizeMatchValidator, ['userIds'])
    results: GameResult[];

}