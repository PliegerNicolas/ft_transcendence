import { Transform, Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, ValidateNested } from "class-validator";
import { UserResultWithUsername } from "./UserResult.dto";
import { GameType } from "../enums/game-type.enum";

export class ReplaceGamelogDto {

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserResultWithUsername)
    @Transform(({ value }) => value.sort((a: UserResultWithUsername, b: UserResultWithUsername) => a.username.localeCompare(b.username)))
    userResults: UserResultWithUsername[];

    @IsNotEmpty()
    @IsEnum(GameType, { message: 'Invalid game type' })
    gameType: GameType;

}