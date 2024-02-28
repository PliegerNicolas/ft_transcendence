import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { User } from "../../users/entities/User.entity";
import { GameResult } from "../enums/game-result.enum";

export class UserResultWithUser {

    @IsNotEmpty()
    @Type(() => User)
    user: User;

    @IsNotEmpty()
    @IsEnum(GameResult, { message: 'Invalid game result' })
    result: GameResult;
    
}

export class UserResultWithUsername {

    @IsNotEmpty()
    @IsString()
    @MaxLength(25)
    username: string;

    @IsNotEmpty()
    @IsEnum(GameResult, { message: 'Invalid game result' })
    result: GameResult;
    
}