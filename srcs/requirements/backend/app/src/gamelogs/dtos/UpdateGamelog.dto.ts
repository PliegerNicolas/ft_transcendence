import { IsArray, IsEnum, IsOptional, ValidateNested } from "class-validator";
import { GameType } from "../entities/Gamelog.entity";
import { UserResultWithUsername } from "./UserResult.dto";
import { Transform, Type } from "class-transformer";

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