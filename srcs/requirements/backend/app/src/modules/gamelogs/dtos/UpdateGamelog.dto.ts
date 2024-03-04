import { Transform, Type } from "class-transformer";
import { IsArray, IsEnum, IsOptional, ValidateNested } from "class-validator";
import { UserResultWithUsername } from "./UserResult.dto";
import { GameType } from "../enums/game-type.enum";

export class UpdateGamelogDto {

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserResultWithUsername)
    @Transform(({ value }) => value.sort((a: UserResultWithUsername, b: UserResultWithUsername) => a.username.localeCompare(b.username)))
    userResults: UserResultWithUsername[];

    @IsOptional()
    @IsEnum(GameType, { message: 'Invalid game type' })
    gameType: GameType;

}