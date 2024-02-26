import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { GameResult } from "../entities/GamelogToUser.entity";
import { User } from "src/users/entities/User.entity";
import { Type } from "class-transformer";

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