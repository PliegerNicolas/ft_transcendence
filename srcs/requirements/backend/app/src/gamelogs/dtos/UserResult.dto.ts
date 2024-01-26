import { IsEnum, IsNotEmpty } from "class-validator";
import { GameResult } from "../entities/UserToGamelog";

export class UserResult {

    @IsNotEmpty()
    id: number;

    @IsNotEmpty()
    @IsEnum(GameResult, { message: 'Invalid game result' })
    result: GameResult;
}