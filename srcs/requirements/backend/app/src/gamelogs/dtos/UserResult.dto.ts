import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { GameResult } from "../entities/GamelogToUser.entity";

export class UserResult {

    @IsNotEmpty()
    @IsString()
    @MaxLength(25)
    username: string;

    @IsNotEmpty()
    @IsEnum(GameResult, { message: 'Invalid game result' })
    result: GameResult;
    
}